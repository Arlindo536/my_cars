from io import StringIO

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import CustomUser


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.payload = {
            'username': 'newuser',
            'password': 'S3cret-pass',
            'confirm_password': 'S3cret-pass',
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
        }

    def test_register_with_matching_passwords_creates_customer(self):
        response = self.client.post('/api/users/register/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        user = CustomUser.objects.get(username='newuser')
        self.assertEqual(user.role, 'customer')
        self.assertTrue(user.check_password('S3cret-pass'))

    def test_register_with_mismatched_passwords_is_rejected(self):
        self.payload['confirm_password'] = 'something-else'
        response = self.client.post('/api/users/register/', self.payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(CustomUser.objects.filter(username='newuser').exists())


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        user = CustomUser(username='login_user', email='l@example.com')
        user.set_password('S3cret-pass')
        user.save()

    def test_login_returns_token_and_role(self):
        response = self.client.post(
            '/api/users/login/',
            {'username': 'login_user', 'password': 'S3cret-pass'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.json())
        self.assertEqual(response.json()['role'], 'customer')

    def test_login_with_wrong_password_is_rejected(self):
        response = self.client.post(
            '/api/users/login/',
            {'username': 'login_user', 'password': 'wrong'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)


class MakeAdminCommandTests(TestCase):
    def test_promotes_existing_user(self):
        CustomUser.objects.create(username='owner', email='o@example.com')
        call_command('make_admin', 'owner', stdout=StringIO())
        user = CustomUser.objects.get(username='owner')
        self.assertEqual(user.role, 'admin')
        self.assertTrue(user.is_staff)

    def test_unknown_user_fails(self):
        with self.assertRaises(CommandError):
            call_command('make_admin', 'nobody', stdout=StringIO())


@override_settings(DEMO_ACCOUNTS=['demo_admin', 'demo_klient'])
class DemoAccountTests(TestCase):
    def setUp(self):
        self.demo_admin = CustomUser.objects.create(username='demo_admin', role='admin')
        self.demo_customer = CustomUser.objects.create(username='demo_klient')
        self.real_admin = CustomUser.objects.create(username='owner', role='admin')
        self.client = APIClient()

    def test_demo_customer_cannot_change_password_profile_or_delete_itself(self):
        self.client.force_authenticate(self.demo_customer)
        self.assertEqual(self.client.post('/api/users/change-password/', {}, format='json').status_code, 403)
        self.assertEqual(self.client.put('/api/users/update-profile/', {}, format='json').status_code, 403)
        self.assertEqual(self.client.delete('/api/users/delete-account/').status_code, 403)
        self.assertEqual(self.client.get('/api/users/update-profile/').status_code, 200)
        self.assertTrue(CustomUser.objects.filter(username='demo_klient').exists())

    def test_demo_admin_cannot_edit_or_delete_users(self):
        self.client.force_authenticate(self.demo_admin)
        url = f'/api/users/admin/{self.real_admin.id}/'
        self.assertEqual(self.client.put(url, {'role': 'customer'}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(url).status_code, 403)
        self.real_admin.refresh_from_db()
        self.assertEqual(self.real_admin.role, 'admin')
        # Reading the user list still works
        self.assertEqual(self.client.get('/api/users/all/').status_code, 200)

    def test_real_admin_is_not_restricted(self):
        self.client.force_authenticate(self.real_admin)
        response = self.client.delete(f'/api/users/admin/{self.demo_customer.id}/')
        self.assertIn(response.status_code, (200, 204))
