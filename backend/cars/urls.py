from django.urls import path
from .views import (
    CarView, CarDetailView, AdminCarCreateView, AdminCarGroupedView,
    CarImageListCreateView, CarImageDetailView,
)

urlpatterns = [
    path('', CarView.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('admin-create/', AdminCarCreateView.as_view(), name='admin-car-create'),
    path('grouped/', AdminCarGroupedView.as_view(), name='admin-car-grouped'),
    path('<int:car_pk>/images/', CarImageListCreateView.as_view(), name='car-image-list'),
    path('<int:car_pk>/images/<int:image_pk>/', CarImageDetailView.as_view(), name='car-image-detail'),
]
