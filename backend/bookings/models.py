from django.db import models

from cars.models import Car
from users.models import CustomUser


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    # Bookings in these states hold the car for their dates
    ACTIVE_STATUSES = ['pending', 'confirmed']

    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    # The car is picked up on start_date and returned on end_date: days = end - start
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gt=models.F('start_date')),
                name='booking_end_after_start',
            ),
        ]

    @property
    def days(self):
        return (self.end_date - self.start_date).days

    @staticmethod
    def overlapping(car, start_date, end_date):
        """Active bookings of `car` that share at least one day with [start_date, end_date)."""
        return Booking.objects.filter(
            car=car,
            status__in=Booking.ACTIVE_STATUSES,
            start_date__lt=end_date,
            end_date__gt=start_date,
        )
