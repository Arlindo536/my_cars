from django.db import models
from users.models import CustomUser
# Create your models here.

class Car(models.Model):
    FUEL_CHOICES= [
        ('petrol','Petrol'),
        ('diesel','Diesel'),
        ('electric','Electric'),
        ('hybrid','Hybrid'),
    ]

    TRANSMISSION_CHOICES = [
        ('manual', 'Manual'),
        ('automatic', 'Automatic'),
    ]
    TYPE_CHOICES = [
        ('sedan','Sedan'),
        ('suv','Suv'),
        ('truck','Truck'),
        ('coupe','Coupe'),
        ('van','Van'),
    ]

    model = models.CharField(max_length=100)
    year = models.IntegerField()
    km = models.IntegerField()

    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES)
    transmission_type = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
