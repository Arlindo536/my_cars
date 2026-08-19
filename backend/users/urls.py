from django.urls import path
from .views import RegisterView, LoginView, UserListView, ChangePasswordView, UpdateProfileView, AdminUserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name = 'login'),
    path('all/', UserListView.as_view(), name='user-list'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('admin/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]