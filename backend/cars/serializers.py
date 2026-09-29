from rest_framework import serializers
from .models import Car, CarImage


class CarImageSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    url = serializers.SerializerMethodField()
    is_primary = serializers.BooleanField(read_only=True)
    uploaded_at = serializers.DateTimeField(read_only=True)

    def get_url(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class CarSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    owner = serializers.SerializerMethodField()
    model = serializers.CharField()
    year = serializers.IntegerField()
    km = serializers.IntegerField()
    fuel_type = serializers.ChoiceField(choices=Car.FUEL_CHOICES)
    transmission_type = serializers.ChoiceField(choices=Car.TRANSMISSION_CHOICES)
    type = serializers.ChoiceField(choices=Car.TYPE_CHOICES)
    images = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    def get_owner(self, obj):
        return obj.owner.username

    def get_images(self, obj):
        return CarImageSerializer(obj.images.all(), many=True, context=self.context).data

    def get_primary_image(self, obj):
        primary = next((img for img in obj.images.all() if img.is_primary), None)
        if primary is None:
            return None
        return CarImageSerializer(primary, context=self.context).data['url']


class AdminCarSerializer(serializers.Serializer):
    owner_id = serializers.IntegerField()
    model = serializers.CharField()
    year = serializers.IntegerField()
    km = serializers.IntegerField()
    fuel_type = serializers.ChoiceField(choices=Car.FUEL_CHOICES)
    transmission_type = serializers.ChoiceField(choices=Car.TRANSMISSION_CHOICES)
    type = serializers.ChoiceField(choices=Car.TYPE_CHOICES)
