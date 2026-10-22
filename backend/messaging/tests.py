from decimal import Decimal

from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from cars.models import Car
from users.models import CustomUser
from .models import Conversation, Message


def make_user(username, role='customer'):
    user = CustomUser(username=username, email=f'{username}@example.com', role=role)
    user.set_password('S3cret-pass')
    user.save()
    return user


class MessagingTestBase(TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in the cache
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

    def start(self, user, body='Is it available in August?', car=None):
        return self.as_user(user).post('/api/messages/conversations/', {
            'car_id': (car or self.car).id, 'body': body,
        }, format='json')

    def thread_url(self, conversation_id):
        return f'/api/messages/conversations/{conversation_id}/messages/'


class StartConversationTests(MessagingTestBase):
    def test_customer_starts_conversation_about_car(self):
        response = self.start(self.alice)
        self.assertEqual(response.status_code, 201)
        conversation = Conversation.objects.get()
        self.assertEqual((conversation.customer, conversation.car), (self.alice, self.car))
        self.assertEqual(conversation.messages.get().body, 'Is it available in August?')

    def test_second_question_reuses_the_thread(self):
        self.start(self.alice)
        response = self.start(self.alice, body='And child seats?')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Conversation.objects.count(), 1)
        self.assertEqual(Message.objects.count(), 2)

    def test_admin_cannot_start_conversation(self):
        self.assertEqual(self.start(self.admin).status_code, 403)

    def test_anonymous_is_rejected(self):
        response = self.client.post('/api/messages/conversations/', {'car_id': self.car.id, 'body': 'Hi'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_unpriced_car_is_404(self):
        self.car.price_per_day = Decimal('0.00')
        self.car.save()
        self.assertEqual(self.start(self.alice).status_code, 404)

    def test_empty_and_too_long_bodies_are_rejected(self):
        self.assertEqual(self.start(self.alice, body='   ').status_code, 400)
        self.assertEqual(self.start(self.alice, body='x' * (Message.MAX_LENGTH + 1)).status_code, 400)
        self.assertFalse(Message.objects.exists())

    def test_body_is_stored_verbatim_as_text(self):
        body = '<img src=x onerror=alert(1)>'
        self.start(self.alice, body=body)
        # No server-side HTML handling: the frontend must render it as text (Angular interpolation)
        self.assertEqual(Message.objects.get().body, body)


class ThreadTests(MessagingTestBase):
    def setUp(self):
        super().setUp()
        self.conversation_id = self.start(self.alice).json()['id']

    def test_other_customer_cannot_read_or_post(self):
        client = self.as_user(self.bob)
        self.assertEqual(client.get(self.thread_url(self.conversation_id)).status_code, 404)
        self.assertEqual(client.post(self.thread_url(self.conversation_id), {'body': 'hi'}, format='json').status_code, 404)

    def test_other_customer_does_not_see_it_in_inbox(self):
        self.assertEqual(self.as_user(self.bob).get('/api/messages/conversations/').json()['count'], 0)

    def test_admin_sees_all_and_replies(self):
        client = self.as_user(self.admin)
        inbox = client.get('/api/messages/conversations/').json()
        self.assertEqual(inbox['count'], 1)
        self.assertEqual(inbox['results'][0]['customer'], 'alice')
        self.assertEqual(inbox['results'][0]['unread'], 1)
        response = client.post(self.thread_url(self.conversation_id), {'body': 'Yes, it is.'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()['mine'])

    def test_reading_marks_the_other_sides_messages_as_read(self):
        self.as_user(self.admin).post(self.thread_url(self.conversation_id), {'body': 'Yes.'}, format='json')
        self.assertEqual(self.as_user(self.alice).get('/api/messages/unread/').json()['unread'], 1)
        self.as_user(self.alice).get(self.thread_url(self.conversation_id))
        self.assertEqual(self.as_user(self.alice).get('/api/messages/unread/').json()['unread'], 0)
        # Alice's own message is still unread for the admin until an admin opens the thread
        self.assertEqual(self.as_user(self.admin).get('/api/messages/unread/').json()['unread'], 1)

    def test_polling_with_after_returns_only_newer_messages(self):
        first = self.as_user(self.alice).get(self.thread_url(self.conversation_id)).json()['messages']
        self.as_user(self.admin).post(self.thread_url(self.conversation_id), {'body': 'New'}, format='json')
        newer = self.as_user(self.alice).get(self.thread_url(self.conversation_id), {'after': first[-1]['id']}).json()
        self.assertEqual([m['body'] for m in newer['messages']], ['New'])
        self.assertFalse(newer['messages'][0]['mine'])
        self.assertEqual(newer['messages'][0]['sender_role'], 'admin')

    def test_invalid_after_is_rejected(self):
        response = self.as_user(self.alice).get(self.thread_url(self.conversation_id), {'after': 'abc'})
        self.assertEqual(response.status_code, 400)


class ThrottleTests(MessagingTestBase):
    def test_sending_is_rate_limited_but_reading_is_not(self):
        conversation_id = self.start(self.alice).json()['id']
        client = self.as_user(self.alice)
        statuses = [
            client.post(self.thread_url(conversation_id), {'body': f'msg {i}'}, format='json').status_code
            for i in range(25)
        ]
        self.assertIn(429, statuses)
        self.assertEqual(client.get(self.thread_url(conversation_id)).status_code, 200)
