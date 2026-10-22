import threading
from datetime import timedelta
from decimal import Decimal

from django.db import connection
from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from rest_framework.test import APIClient

from cars.models import Car
from users.models import CustomUser
from .models import Booking


def make_user(username, role='customer'):
    user = CustomUser(username=username, email=f'{username}@example.com', role=role)
    user.set_password('S3cret-pass')
    user.save()
    return user


def day(offset):
    return timezone.localdate() + timedelta(days=offset)


class BookingTestBase(TestCase):
    def setUp(self):
        self.admin = make_user('boss', role='admin')
        self.alice = make_user('alice')
        self.bob = make_user('bob')
        self.car = Car.objects.create(
            model='VW Golf', year=2021, km=1000, fuel_type='diesel', transmission_type='manual',
            type='hatchback', price_per_day=Decimal('35.00'), owner=self.admin,
        )
        self.client = APIClient()

    def as_user(self, user):
        self.client.force_authenticate(user)
        return self.client

    def book(self, user, start, end, car=None):
        return self.as_user(user).post('/api/bookings/', {
            'car_id': (car or self.car).id, 'start_date': day(start), 'end_date': day(end),
        }, format='json')

    def make_booking(self, customer, start, end, status='pending'):
        return Booking.objects.create(
            car=self.car, customer=customer, start_date=day(start), end_date=day(end),
            total_price=Decimal('1.00'), status=status,
        )


class CreateBookingTests(BookingTestBase):
    def test_customer_books_and_server_computes_price(self):
        response = self.as_user(self.alice).post('/api/bookings/', {
            'car_id': self.car.id, 'start_date': day(5), 'end_date': day(8),
            'total_price': '0.01',  # must be ignored
        }, format='json')
        self.assertEqual(response.status_code, 201)
        booking = Booking.objects.get()
        self.assertEqual(booking.total_price, Decimal('105.00'))
        self.assertEqual(booking.status, 'pending')
        self.assertEqual(booking.customer, self.alice)
        self.assertEqual(response.json()['days'], 3)

    def test_overlapping_booking_is_rejected(self):
        self.assertEqual(self.book(self.alice, 5, 10).status_code, 201)
        for start, end in [(5, 10), (4, 6), (9, 12), (6, 7), (3, 12)]:
            self.assertEqual(self.book(self.bob, start, end).status_code, 409, (start, end))
        self.assertEqual(Booking.objects.count(), 1)

    def test_return_day_can_be_next_pickup_day(self):
        self.assertEqual(self.book(self.alice, 5, 10).status_code, 201)
        self.assertEqual(self.book(self.bob, 10, 12).status_code, 201)
        self.assertEqual(self.book(self.bob, 2, 5).status_code, 201)

    def test_cancelled_and_rejected_bookings_free_the_dates(self):
        self.make_booking(self.alice, 5, 10, status='cancelled')
        self.make_booking(self.alice, 5, 10, status='rejected')
        self.assertEqual(self.book(self.bob, 5, 10).status_code, 201)

    def test_other_car_is_not_blocked(self):
        other = Car.objects.create(
            model='Fiat 500', year=2020, km=1, fuel_type='petrol', transmission_type='manual',
            type='hatchback', price_per_day=Decimal('25.00'), owner=self.admin,
        )
        self.book(self.alice, 5, 10)
        self.assertEqual(self.book(self.bob, 5, 10, car=other).status_code, 201)

    def test_invalid_dates_are_rejected(self):
        for start, end in [(-1, 2), (5, 5), (6, 5), (1, 32), (400, 402)]:
            self.assertEqual(self.book(self.alice, start, end).status_code, 400, (start, end))

    def test_unpriced_car_cannot_be_booked(self):
        self.car.price_per_day = Decimal('0.00')
        self.car.save()
        self.assertEqual(self.book(self.alice, 5, 6).status_code, 404)

    def test_admin_cannot_book(self):
        self.assertEqual(self.book(self.admin, 5, 6).status_code, 403)

    def test_anonymous_cannot_book(self):
        response = self.client.post('/api/bookings/', {
            'car_id': self.car.id, 'start_date': day(5), 'end_date': day(6),
        }, format='json')
        self.assertEqual(response.status_code, 401)


class ListAndDetailTests(BookingTestBase):
    def setUp(self):
        super().setUp()
        self.alice_booking = self.make_booking(self.alice, 5, 7)
        self.bob_booking = self.make_booking(self.bob, 10, 12)

    def test_customer_lists_only_own_bookings(self):
        response = self.as_user(self.alice).get('/api/bookings/')
        self.assertEqual([b['id'] for b in response.json()['results']], [self.alice_booking.id])

    def test_admin_lists_all_bookings(self):
        self.assertEqual(self.as_user(self.admin).get('/api/bookings/').json()['count'], 2)

    def test_customer_cannot_read_someone_elses_booking(self):
        response = self.as_user(self.alice).get(f'/api/bookings/{self.bob_booking.id}/')
        self.assertEqual(response.status_code, 404)

    def test_customer_reads_own_booking(self):
        response = self.as_user(self.alice).get(f'/api/bookings/{self.alice_booking.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['car']['model'], 'VW Golf')


class StatusChangeTests(BookingTestBase):
    def test_customer_cancels_own_future_booking(self):
        booking = self.make_booking(self.alice, 5, 7)
        response = self.as_user(self.alice).post(f'/api/bookings/{booking.id}/cancel/')
        self.assertEqual(response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')

    def test_customer_cannot_cancel_someone_elses_booking(self):
        booking = self.make_booking(self.bob, 5, 7)
        self.assertEqual(self.as_user(self.alice).post(f'/api/bookings/{booking.id}/cancel/').status_code, 404)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'pending')

    def test_started_booking_cannot_be_cancelled(self):
        booking = self.make_booking(self.alice, 0, 3, status='confirmed')
        self.assertEqual(self.as_user(self.alice).post(f'/api/bookings/{booking.id}/cancel/').status_code, 400)

    def test_admin_confirms_and_rejects_pending(self):
        first = self.make_booking(self.alice, 5, 7)
        second = self.make_booking(self.bob, 10, 12)
        client = self.as_user(self.admin)
        self.assertEqual(client.post(f'/api/bookings/{first.id}/confirm/').status_code, 200)
        self.assertEqual(client.post(f'/api/bookings/{second.id}/reject/').status_code, 200)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertEqual((first.status, second.status), ('confirmed', 'rejected'))

    def test_only_pending_can_be_decided(self):
        booking = self.make_booking(self.alice, 5, 7, status='cancelled')
        self.assertEqual(self.as_user(self.admin).post(f'/api/bookings/{booking.id}/confirm/').status_code, 400)

    def test_customer_cannot_confirm(self):
        booking = self.make_booking(self.alice, 5, 7)
        self.assertEqual(self.as_user(self.alice).post(f'/api/bookings/{booking.id}/confirm/').status_code, 403)


class QuoteAndAvailabilityTests(BookingTestBase):
    def quote(self, start, end):
        return self.client.post('/api/bookings/quote/', {
            'car_id': self.car.id, 'start_date': day(start), 'end_date': day(end),
        }, format='json')

    def test_quote_is_public_and_computes_total(self):
        response = self.quote(5, 9)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['days'], 4)
        self.assertEqual(response.json()['total_price'], '140.00')
        self.assertTrue(response.json()['available'])

    def test_quote_reports_unavailable(self):
        self.make_booking(self.alice, 6, 8)
        self.assertFalse(self.quote(5, 9).json()['available'])

    def test_availability_lists_active_future_ranges_without_customer(self):
        self.make_booking(self.alice, 5, 7, status='confirmed')
        self.make_booking(self.alice, 10, 12, status='cancelled')
        self.make_booking(self.alice, -5, -2, status='confirmed')
        response = self.client.get(f'/api/cars/{self.car.id}/availability/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['booked'], [
            {'start_date': str(day(5)), 'end_date': str(day(7))},
        ])


class ConcurrentBookingTests(TransactionTestCase):
    """Two customers booking the same dates at the same moment: exactly one must win."""

    def test_parallel_requests_create_only_one_booking(self):
        admin = make_user('boss', role='admin')
        customers = [make_user('alice'), make_user('bob')]
        car = Car.objects.create(
            model='VW Golf', year=2021, km=1000, fuel_type='diesel', transmission_type='manual',
            type='hatchback', price_per_day=Decimal('35.00'), owner=admin,
        )
        barrier = threading.Barrier(len(customers))
        results = []

        def book(customer):
            client = APIClient()
            client.force_authenticate(customer)
            barrier.wait()
            try:
                response = client.post('/api/bookings/', {
                    'car_id': car.id, 'start_date': day(5), 'end_date': day(8),
                }, format='json')
                results.append(response.status_code)
            finally:
                connection.close()

        threads = [threading.Thread(target=book, args=(c,)) for c in customers]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(sorted(results), [201, 409])
        self.assertEqual(Booking.objects.count(), 1)
