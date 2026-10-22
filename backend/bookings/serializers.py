from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers


MAX_RENTAL_DAYS = 30
MAX_DAYS_AHEAD = 365


class BookingRequestSerializer(serializers.Serializer):
    """Input for both the quote and the booking: which car, from when to when."""
    car_id = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, data):
        today = timezone.localdate()
        start, end = data['start_date'], data['end_date']
        if start < today:
            raise serializers.ValidationError("The start date cannot be in the past.")
        if end <= start:
            raise serializers.ValidationError("The return date must be after the pick-up date.")
        if (end - start).days > MAX_RENTAL_DAYS:
            raise serializers.ValidationError(f"A booking can last at most {MAX_RENTAL_DAYS} days.")
        if start > today + timedelta(days=MAX_DAYS_AHEAD):
            raise serializers.ValidationError("Bookings can be made at most one year ahead.")
        return data


class BookingSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    car = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    days = serializers.IntegerField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()

    def get_car(self, obj):
        return {'id': obj.car.id, 'model': obj.car.model, 'year': obj.car.year}

    def get_customer(self, obj):
        return obj.customer.username


class BookedRangeSerializer(serializers.Serializer):
    """Public availability: dates only, nothing about who booked."""
    start_date = serializers.DateField()
    end_date = serializers.DateField()
