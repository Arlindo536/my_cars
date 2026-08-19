from django.urls import path
from .views import CarView, CarDetailView, AdminCarCreateView

urlpatterns = [
    path('', CarView.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('admin-create/', AdminCarCreateView.as_view(), name='admin-car-create'),

]
