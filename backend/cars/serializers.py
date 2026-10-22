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

class CatalogCarSerializer(serializers.Serializer):
    """Public view of a car: no owner details."""
    id = serializers.IntegerField(read_only=True)
    model = serializers.CharField()
    year = serializers.IntegerField()
    km = serializers.IntegerField()
    fuel_type = serializers.CharField()
    transmission_type = serializers.CharField()
    type = serializers.CharField()
    price_per_day = serializers.DecimalField(max_digits=8, decimal_places=2)
    description = serializers.CharField()
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


class CatalogQuerySerializer(serializers.Serializer):
    """Validates the catalog's query parameters."""
    ORDERING_CHOICES = ['price_per_day', '-price_per_day', 'year', '-year', 'model', '-model']

    search = serializers.CharField(required=False, allow_blank=True, max_length=100)
    type = serializers.ChoiceField(choices=Car.TYPE_CHOICES, required=False)
    fuel = serializers.ChoiceField(choices=Car.FUEL_CHOICES, required=False)
    transmission = serializers.ChoiceField(choices=Car.TRANSMISSION_CHOICES, required=False)
    min_price = serializers.DecimalField(
        max_digits=8, decimal_places=2, min_value=Decimal('0.00'), required=False
    )
    max_price = serializers.DecimalField(
        max_digits=8, decimal_places=2, min_value=Decimal('0.00'), required=False
    )
    ordering = serializers.ChoiceField(choices=ORDERING_CHOICES, required=False)

    def validate(self, data):
        if 'min_price' in data and 'max_price' in data and data['min_price'] > data['max_price']:
            raise serializers.ValidationError("min_price cannot be greater than max_price.")
        return data
