from django.db import models

from cars.models import Car
from users.models import CustomUser


class Conversation(models.Model):
    """One thread per customer and car; any admin can answer on behalf of the rental."""
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='conversations')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    # Bumped on every new message so the inbox can show the latest threads first
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(fields=['customer', 'car'], name='one_conversation_per_customer_car'),
        ]


class Message(models.Model):
    MAX_LENGTH = 2000

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    body = models.TextField(max_length=MAX_LENGTH)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']
