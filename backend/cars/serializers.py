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

    def get_owner(self, obj):
        return obj.owner.username