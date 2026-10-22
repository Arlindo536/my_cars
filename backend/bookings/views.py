from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from cars.views import catalog_cars
from .models import Booking
from .serializers import BookedRangeSerializer, BookingRequestSerializer, BookingSerializer


class BookingPagination(PageNumberPagination):
    page_size = 10


def bookings_visible_to(user):
    # Customers only ever see their own bookings; other ids behave as "not found"
    bookings = Booking.objects.select_related('car', 'customer')
    if user.role == 'admin':
        return bookings
    return bookings.filter(customer=user)


class QuoteView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = BookingRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        car = get_object_or_404(catalog_cars(), pk=data['car_id'])
        days = (data['end_date'] - data['start_date']).days
        available = not Booking.overlapping(car, data['start_date'], data['end_date']).exists()
        return Response({
            'car_id': car.id,
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'days': days,
            # Money as strings, like the serializers' DecimalField output, never floats
            'price_per_day': str(car.price_per_day),
            'total_price': str(car.price_per_day * days),
            'available': available,
        })


class BookingView(APIView):
    def get(self, request):
        bookings = bookings_visible_to(request.user)
        status_filter = request.query_params.get('status')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        paginator = BookingPagination()
        result_page = paginator.paginate_queryset(bookings, request)
        serializer = BookingSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if request.user.role != 'customer':
            return Response({"error": "Only customers can book cars."}, status=status.HTTP_403_FORBIDDEN)
        serializer = BookingRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data

        with transaction.atomic():
            # Locking the car row serialises concurrent bookings of the same car,
            # so two requests cannot both pass the overlap check
            car = get_object_or_404(catalog_cars().select_for_update(), pk=data['car_id'])
            if Booking.overlapping(car, data['start_date'], data['end_date']).exists():
                return Response(
                    {"error": "The car is already booked for some of these dates."},
                    status=status.HTTP_409_CONFLICT,
                )
            days = (data['end_date'] - data['start_date']).days
            booking = Booking.objects.create(
                car=car,
                customer=request.user,
                start_date=data['start_date'],
                end_date=data['end_date'],
                total_price=car.price_per_day * days,
            )
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingDetailView(APIView):
    def get(self, request, pk):
        booking = get_object_or_404(bookings_visible_to(request.user), pk=pk)
        return Response(BookingSerializer(booking).data)


class BookingCancelView(APIView):
    def post(self, request, pk):
        booking = get_object_or_404(Booking.objects.filter(customer=request.user), pk=pk)
        if booking.status not in Booking.ACTIVE_STATUSES:
            return Response({"error": "This booking cannot be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        if booking.start_date <= timezone.localdate():
            return Response({"error": "A booking that has started cannot be cancelled."},
                            status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data)


class AdminBookingDecisionView(APIView):
    new_status = None

    def post(self, request, pk):
        if request.user.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        booking = get_object_or_404(Booking, pk=pk)
        if booking.status != 'pending':
            return Response({"error": "Only pending bookings can be confirmed or rejected."},
                            status=status.HTTP_400_BAD_REQUEST)
        booking.status = self.new_status
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data)


class BookingConfirmView(AdminBookingDecisionView):
    new_status = 'confirmed'


class BookingRejectView(AdminBookingDecisionView):
    new_status = 'rejected'


class CarAvailabilityView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, pk):
        car = get_object_or_404(catalog_cars(), pk=pk)
        booked = Booking.objects.filter(
            car=car,
            status__in=Booking.ACTIVE_STATUSES,
            end_date__gt=timezone.localdate(),
        ).order_by('start_date')
        return Response({'car_id': car.id, 'booked': BookedRangeSerializer(booked, many=True).data})
