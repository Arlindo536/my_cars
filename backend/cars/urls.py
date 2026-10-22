from django.urls import path
from .views import CarView, CarDetailView, AdminCarCreateView, AdminCarGroupedView, CatalogListView, CatalogDetailView, CarImageView

urlpatterns = [
    path('', CarView.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('<int:pk>/image/', CarImageView.as_view(), name='car-image'),
    path('admin-create/', AdminCarCreateView.as_view(), name='admin-car-create'),
    path('catalog/', CatalogListView.as_view(), name='catalog-list'),
    path('catalog/<int:pk>/', CatalogDetailView.as_view(), name='catalog-detail'),
    path('grouped/', AdminCarGroupedView.as_view(), name='admin-car-grouped'),
]