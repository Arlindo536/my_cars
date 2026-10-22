from io import StringIO

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
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
