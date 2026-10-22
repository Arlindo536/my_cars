import os
import shutil
import tempfile
from decimal import Decimal
from io import BytesIO, StringIO

from django.core.management import call_command
from django.core.management.base import CommandError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
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


def image_upload(name='photo.png', image_format='PNG', size=(64, 40), exif_gps=False):
    buffer = BytesIO()
    image = Image.new('RGB', size, (200, 16, 46))
    kwargs = {}
    if exif_gps:
        exif = Image.Exif()
        exif[0x8825] = {2: (41.0, 19.0, 48.0)}  # GPSInfo
        kwargs['exif'] = exif
    image.save(buffer, format=image_format, **kwargs)
    return SimpleUploadedFile(name, buffer.getvalue(), content_type=f'image/{image_format.lower()}')


class FleetAdminTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.media)
        self.override.enable()
        self.admin = make_user('boss', role='admin')
        self.customer = make_user('cust')
        self.client = APIClient()
        self.car = Car.objects.create(
            model='VW Golf', year=2021, km=1000, fuel_type='diesel', transmission_type='manual',
            type='hatchback', price_per_day=Decimal('35.00'), owner=self.admin,
        )

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media, ignore_errors=True)

    def as_user(self, user):
        self.client.force_authenticate(user)
        return self.client

    def upload(self, user, file):
        return self.as_user(user).post(f'/api/cars/{self.car.id}/image/', {'image': file}, format='multipart')

    def test_admin_create_defaults_owner_to_admin(self):
        response = self.as_user(self.admin).post('/api/cars/admin-create/', {
            'model': 'Fiat 500', 'year': 2020, 'km': 1, 'fuel_type': 'petrol',
            'transmission_type': 'manual', 'type': 'hatchback', 'price_per_day': '25.00',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Car.objects.get(model='Fiat 500').owner, self.admin)

    def test_customers_can_no_longer_add_cars(self):
        response = self.as_user(self.customer).post('/api/cars/', {
            'model': 'Mine', 'year': 2020, 'km': 1, 'fuel_type': 'petrol',
            'transmission_type': 'manual', 'type': 'sedan',
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_upload_is_reencoded_as_jpeg_with_random_name(self):
        response = self.upload(self.admin, image_upload(name='../../evil name.png'))
        self.assertEqual(response.status_code, 200)
        self.car.refresh_from_db()
        self.assertRegex(self.car.image.name, r'^cars/[0-9a-f]{32}\.jpg$')
        self.assertTrue(response.json()['image'].startswith('http://testserver/media/cars/'))
        with Image.open(self.car.image.path) as stored:
            self.assertEqual(stored.format, 'JPEG')

    def test_exif_gps_is_removed(self):
        self.upload(self.admin, image_upload(name='p.jpg', image_format='JPEG', exif_gps=True))
        self.car.refresh_from_db()
        with Image.open(self.car.image.path) as stored:
            self.assertNotIn(0x8825, stored.getexif())

    def test_large_images_are_resized(self):
        self.upload(self.admin, image_upload(size=(3200, 2000)))
        self.car.refresh_from_db()
        with Image.open(self.car.image.path) as stored:
            self.assertLessEqual(max(stored.size), 1600)

    def test_non_images_and_wrong_formats_are_rejected(self):
        fake = SimpleUploadedFile('x.png', b'<?php echo 1; ?>', content_type='image/png')
        self.assertEqual(self.upload(self.admin, fake).status_code, 400)
        gif = image_upload(name='x.gif', image_format='GIF')
        self.assertEqual(self.upload(self.admin, gif).status_code, 400)
        self.car.refresh_from_db()
        self.assertFalse(self.car.image)

    def test_too_large_file_is_rejected(self):
        big = SimpleUploadedFile('big.png', b'0' * (5 * 1024 * 1024 + 1), content_type='image/png')
        self.assertEqual(self.upload(self.admin, big).status_code, 400)

    def test_customer_cannot_upload(self):
        self.assertEqual(self.upload(self.customer, image_upload()).status_code, 403)

    def test_replacing_and_deleting_removes_old_files(self):
        self.upload(self.admin, image_upload())
        self.car.refresh_from_db()
        first = self.car.image.path
        self.upload(self.admin, image_upload())
        self.assertFalse(os.path.exists(first))
        self.car.refresh_from_db()
        second = self.car.image.path
        self.assertEqual(self.as_user(self.admin).delete(f'/api/cars/{self.car.id}/image/').status_code, 200)
        self.assertFalse(os.path.exists(second))
        self.car.refresh_from_db()
        self.assertFalse(self.car.image)

    def test_deleting_car_deletes_its_photo(self):
        self.upload(self.admin, image_upload())
        self.car.refresh_from_db()
        path = self.car.image.path
        self.as_user(self.admin).delete(f'/api/cars/{self.car.id}/')
        self.assertFalse(os.path.exists(path))
