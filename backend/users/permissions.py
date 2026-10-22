from django.conf import settings
from rest_framework.permissions import SAFE_METHODS, BasePermission


def is_demo_account(user):
    return user.is_authenticated and user.username in settings.DEMO_ACCOUNTS


class NotDemoAccount(BasePermission):
    """Public demo accounts can look around but not change accounts: their own
    password/profile, deleting themselves, or editing and deleting other users."""
    message = 'This action is disabled for demo accounts.'

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or not is_demo_account(request.user)
