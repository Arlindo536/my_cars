from rest_framework.permissions import BasePermission

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.owner == request.user


def user_can_manage_car(request, car):
    """Admins can manage any car; a regular user only their own."""
    return request.user.role == 'admin' or car.owner == request.user
