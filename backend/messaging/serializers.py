from rest_framework import serializers

from .models import Message


class MessageInputSerializer(serializers.Serializer):
    # Stored as plain text; the frontend renders it with interpolation (escaped), never as HTML
    body = serializers.CharField(max_length=Message.MAX_LENGTH, trim_whitespace=True)


class StartConversationSerializer(MessageInputSerializer):
    car_id = serializers.IntegerField()


class MessageSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    body = serializers.CharField()
    created_at = serializers.DateTimeField()
    is_read = serializers.BooleanField()
    mine = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()

    def get_mine(self, obj):
        return obj.sender_id == self.context['request'].user.id

    def get_sender_role(self, obj):
        return obj.sender.role


class ConversationSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    car = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField()
    last_message = serializers.SerializerMethodField()
    unread = serializers.SerializerMethodField()

    def get_car(self, obj):
        return {'id': obj.car.id, 'model': obj.car.model, 'year': obj.car.year}

    def get_customer(self, obj):
        return obj.customer.username

    def get_last_message(self, obj):
        last = obj.messages.order_by('-id').first()
        if last is None:
            return None
        return {'body': last.body[:140], 'created_at': last.created_at, 'mine': last.sender_id == self.context['request'].user.id}

    def get_unread(self, obj):
        return obj.messages.filter(is_read=False).exclude(sender=self.context['request'].user).count()
