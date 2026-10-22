from django.db import transaction
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from cars.views import catalog_cars
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, MessageInputSerializer, MessageSerializer, StartConversationSerializer,
)


class ConversationPagination(PageNumberPagination):
    page_size = 20


class SendMessageThrottle(UserRateThrottle):
    """Limits sending (POST) only, so polling for new messages is never throttled."""
    scope = 'send_message'

    def allow_request(self, request, view):
        if request.method != 'POST':
            return True
        return super().allow_request(request, view)


def conversations_visible_to(user):
    # Customers only see their own threads; other ids behave as "not found"
    conversations = Conversation.objects.select_related('car', 'customer')
    if user.role == 'admin':
        return conversations
    return conversations.filter(customer=user)


def add_message(conversation, sender, body):
    with transaction.atomic():
        message = Message.objects.create(conversation=conversation, sender=sender, body=body)
        conversation.save(update_fields=['updated_at'])
    return message


class ConversationView(APIView):
    throttle_classes = [SendMessageThrottle]

    def get(self, request):
        paginator = ConversationPagination()
        page = paginator.paginate_queryset(conversations_visible_to(request.user), request)
        serializer = ConversationSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """A customer asks about a car: reuses their thread for that car or starts one."""
        if request.user.role != 'customer':
            return Response({"error": "Only customers can start a conversation."}, status=status.HTTP_403_FORBIDDEN)
        serializer = StartConversationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        car = get_object_or_404(catalog_cars(), pk=data['car_id'])
        conversation, created = Conversation.objects.get_or_create(customer=request.user, car=car)
        add_message(conversation, request.user, data['body'])
        return Response(
            ConversationSerializer(conversation, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ConversationMessagesView(APIView):
    throttle_classes = [SendMessageThrottle]

    def get(self, request, pk):
        conversation = get_object_or_404(conversations_visible_to(request.user), pk=pk)
        messages = conversation.messages.select_related('sender')
        # Polling: the client passes the last id it has and only gets newer messages
        after = request.query_params.get('after')
        if after:
            if not after.isdigit():
                return Response({"error": "after must be a message id."}, status=status.HTTP_400_BAD_REQUEST)
            messages = messages.filter(id__gt=int(after))
        messages = list(messages)

        # Reading the thread marks the other side's messages as read
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

        return Response({
            'conversation': ConversationSerializer(conversation, context={'request': request}).data,
            'messages': MessageSerializer(messages, many=True, context={'request': request}).data,
        })

    def post(self, request, pk):
        conversation = get_object_or_404(conversations_visible_to(request.user), pk=pk)
        serializer = MessageInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        message = add_message(conversation, request.user, serializer.validated_data['body'])
        return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)


class UnreadCountView(APIView):
    def get(self, request):
        conversations = conversations_visible_to(request.user)
        unread = Message.objects.filter(conversation__in=conversations, is_read=False).exclude(sender=request.user)
        return Response({'unread': unread.count()})
