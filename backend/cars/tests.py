from decimal import Decimal
from io import StringIO

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from rest_framework.test import APIClient

from users.models import CustomUser
from .management.commands.seed_demo import DEMO_CARS
from .models import Car


def make_user(username, role='customer'):
    user = CustomUser(username=username, email=f'{username}@example.com', role=role)
    user.set_password('S3cret-pass')
    user.save()
    return user


class CarFieldsApiTests(TestCase):
    def setUp(self):
        self.admin = make_user('boss', role='admin')
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        self.payload = {
            'owner_id': self.admin.id,
            'model': 'Test Car',
            'year': 2022,
            'km': 1000,
            'fuel_type': 'petrol',
            'transmission_type': 'manual',
            'type': 'hatchback',
            'price_per_day': '42.50',
            'description': 'A test car.',
        }

    def test_admin_create_stores_price_description_and_hatchback(self):
        response = self.client.post('/api/cars/admin-create/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        car = Car.objects.get(model='Test Car')
        self.assertEqual(car.price_per_day, Decimal('42.50'))
        self.assertEqual(car.type, 'hatchback')
        self.assertEqual(response.json()['price_per_day'], '42.50')
        self.assertEqual(response.json()['description'], 'A test car.')
        self.assertIsNone(response.json()['image'])

    def test_price_defaults_to_zero_when_missing(self):
        del self.payload['price_per_day']
        del self.payload['description']
        response = self.client.post('/api/cars/admin-create/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        car = Car.objects.get(model='Test Car')
        self.assertEqual(car.price_per_day, Decimal('0.00'))
        self.assertEqual(car.description, '')

    def test_negative_price_is_rejected(self):
        self.payload['price_per_day'] = '-1.00'
        response = self.client.post('/api/cars/admin-create/', self.payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Car.objects.exists())

    def test_update_without_price_keeps_existing_price(self):
        # The current frontend edit form does not send price/description yet
        car = Car.objects.create(
            model='Old', year=2020, km=5, fuel_type='diesel', transmission_type='manual',
            type='sedan', price_per_day=Decimal('55.00'), description='Keep me', owner=self.admin,
        )
        response = self.client.put(f'/api/cars/{car.id}/', {
            'model': 'Renamed', 'year': 2020, 'km': 10, 'fuel_type': 'diesel',
            'transmission_type': 'manual', 'type': 'sedan',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        car.refresh_from_db()
        self.assertEqual(car.model, 'Renamed')
        self.assertEqual(car.price_per_day, Decimal('55.00'))
        self.assertEqual(car.description, 'Keep me')


class SeedDemoCommandTests(TestCase):
    def test_seed_creates_demo_fleet_for_first_admin(self):
        admin = make_user('boss', role='admin')
        call_command('seed_demo', stdout=StringIO())
        self.assertEqual(Car.objects.filter(owner=admin).count(), len(DEMO_CARS))
        self.assertFalse(Car.objects.filter(price_per_day__lte=0).exists())

    def test_seed_is_idempotent(self):
        make_user('boss', role='admin')
        call_command('seed_demo', stdout=StringIO())
        call_command('seed_demo', stdout=StringIO())
        self.assertEqual(Car.objects.count(), len(DEMO_CARS))

    def test_seed_without_admin_fails(self):
        make_user('someone')
        with self.assertRaises(CommandError):
            call_command('seed_demo', stdout=StringIO())

    def test_seed_rejects_non_admin_owner(self):
        make_user('boss', role='admin')
        make_user('someone')
        with self.assertRaises(CommandError):
            call_command('seed_demo', '--owner', 'someone', stdout=StringIO())


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_user('boss', role='admin')
        customer = make_user('cust')

        def car(model, price, **extra):
            fields = dict(
                model=model, year=2021, km=1000, fuel_type='petrol', transmission_type='manual',
                type='sedan', price_per_day=Decimal(price), owner=self.admin,
            )
            fields.update(extra)
            return Car.objects.create(**fields)

        self.golf = car('VW Golf', '35.00', type='hatchback', fuel_type='diesel')
        self.tesla = car('Tesla Model 3', '85.00', fuel_type='electric', transmission_type='automatic', year=2023)
        self.duster = car('Dacia Duster', '40.00', type='suv', fuel_type='diesel')
        self.unpriced = car('Old customer car', '0.00', owner=customer)

    def ids(self, response):
        return [c['id'] for c in response.json()['results']]

    def test_catalog_is_public_and_hides_unpriced_cars(self):
        response = self.client.get('/api/cars/catalog/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 3)
        self.assertNotIn(self.unpriced.id, self.ids(response))

    def test_catalog_ignores_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token not-a-real-token')
        self.assertEqual(self.client.get('/api/cars/catalog/').status_code, 200)

    def test_catalog_does_not_expose_owner(self):
        result = self.client.get('/api/cars/catalog/').json()['results'][0]
        self.assertNotIn('owner', result)

    def test_default_ordering_is_cheapest_first(self):
        response = self.client.get('/api/cars/catalog/')
        self.assertEqual(self.ids(response), [self.golf.id, self.duster.id, self.tesla.id])

    def test_ordering_by_year_descending(self):
        response = self.client.get('/api/cars/catalog/', {'ordering': '-year'})
        self.assertEqual(self.ids(response)[0], self.tesla.id)

    def test_filters_combine(self):
        response = self.client.get('/api/cars/catalog/', {'fuel': 'diesel', 'type': 'suv'})
        self.assertEqual(self.ids(response), [self.duster.id])

    def test_search_and_transmission(self):
        response = self.client.get('/api/cars/catalog/', {'search': 'tesla', 'transmission': 'automatic'})
        self.assertEqual(self.ids(response), [self.tesla.id])

    def test_price_range(self):
        response = self.client.get('/api/cars/catalog/', {'min_price': '36', 'max_price': '80'})
        self.assertEqual(self.ids(response), [self.duster.id])

    def test_invalid_parameters_are_rejected(self):
        for params in ({'ordering': 'owner'}, {'fuel': 'coal'}, {'min_price': 'abc'},
                       {'min_price': '90', 'max_price': '10'}):
            self.assertEqual(self.client.get('/api/cars/catalog/', params).status_code, 400, params)

    def test_detail_is_public(self):
        response = self.client.get(f'/api/cars/catalog/{self.golf.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['model'], 'VW Golf')
        self.assertEqual(response.json()['price_per_day'], '35.00')

    def test_detail_of_unpriced_car_is_404(self):
        self.assertEqual(self.client.get(f'/api/cars/catalog/{self.unpriced.id}/').status_code, 404)

    def test_owner_only_endpoints_still_require_login(self):
        self.assertEqual(self.client.get('/api/cars/').status_code, 401)
        self.assertEqual(self.client.get(f'/api/cars/{self.golf.id}/').status_code, 401)
