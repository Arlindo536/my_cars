from django.urls import path
from .views import (
    BookingView, BookingDetailView, BookingCancelView, BookingConfirmView, BookingRejectView, QuoteView,
)

urlpatterns = [
    path('', BookingView.as_view(), name='booking-list'),
    path('quote/', QuoteView.as_view(), name='booking-quote'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('<int:pk>/confirm/', BookingConfirmView.as_view(), name='booking-confirm'),
    path('<int:pk>/reject/', BookingRejectView.as_view(), name='booking-reject'),
]
