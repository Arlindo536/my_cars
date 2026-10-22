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
