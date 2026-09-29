import uuid
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


def car_image_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'car_images/{instance.car_id}/{uuid.uuid4().hex}.{ext}'


class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=car_image_path)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
