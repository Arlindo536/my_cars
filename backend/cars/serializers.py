from decimal import Decimal

from rest_framework import serializers
from .models import Car


class CarSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    owner = serializers.SerializerMethodField()
    model = serializers.CharField()
    year = serializers.IntegerField()
    km = serializers.IntegerField()
    fuel_type = serializers.ChoiceField(choices=Car.FUEL_CHOICES)
    transmission_type = serializers.ChoiceField(choices=Car.TRANSMISSION_CHOICES)
    type = serializers.ChoiceField(choices=Car.TYPE_CHOICES)
    price_per_day = serializers.DecimalField(
        max_digits=8, decimal_places=2, min_value=Decimal('0.00'), required=False
    )
    description = serializers.CharField(required=False, allow_blank=True)

    image = serializers.SerializerMethodField()

    def get_owner(self, obj):
        return obj.owner.username

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class AdminCarSerializer(serializers.Serializer):
    owner_id = serializers.IntegerField()
    model = serializers.CharField()
    year = serializers.IntegerField()
    km = serializers.IntegerField()
    fuel_type = serializers.ChoiceField(choices=Car.FUEL_CHOICES)
    transmission_type = serializers.ChoiceField(choices=Car.TRANSMISSION_CHOICES)
    type = serializers.ChoiceField(choices=Car.TYPE_CHOICES)
    price_per_day = serializers.DecimalField(
        max_digits=8, decimal_places=2, min_value=Decimal('0.00'), required=False
    )
    description = serializers.CharField(required=False, allow_blank=True)