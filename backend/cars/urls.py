from django.urls import path
from .views import CarView, CarDetailView

urlpatterns = [
    path('', CarView.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
]
