from django.urls import path
from .views import ConversationMessagesView, ConversationView, UnreadCountView

urlpatterns = [
    path('conversations/', ConversationView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/messages/', ConversationMessagesView.as_view(), name='conversation-messages'),
    path('unread/', UnreadCountView.as_view(), name='messages-unread'),
]
