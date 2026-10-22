from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from cars.models import Car
from users.models import CustomUser


# Fictional demo fleet: prices are in EUR per day and do not reflect real offers.
# (model, year, km, fuel_type, transmission_type, type, price_per_day, description)
DEMO_CARS = [
    ('Volkswagen Golf 8', 2021, 48000, 'diesel', 'manual', 'hatchback', '35.00',
     'Hatchback i besueshëm dhe ekonomik, ideal për qytetin dhe udhëtime të gjata.'),
    ('Toyota Yaris Hybrid', 2022, 31000, 'hybrid', 'automatic', 'hatchback', '32.00',
     'Konsum shumë i ulët dhe parkim i lehtë në rrugët e ngushta të Tiranës.'),
    ('Fiat 500', 2020, 56000, 'petrol', 'manual', 'hatchback', '25.00',
     'Makinë e vogël dhe simpatike, perfekte për qytetin.'),
    ('Renault Clio V', 2021, 42000, 'petrol', 'manual', 'hatchback', '27.00',
     'Kompakte, e rehatshme dhe me ekran multimedia me Apple CarPlay.'),
    ('Skoda Octavia', 2020, 87000, 'diesel', 'manual', 'sedan', '38.00',
     'Bagazh i madh dhe konsum i ulët, zgjedhje e mirë për familje.'),
    ('Mercedes-Benz C 220d', 2021, 64000, 'diesel', 'automatic', 'sedan', '75.00',
     'Sedan premium me komoditet të lartë për udhëtime pune ose ceremoni.'),
    ('BMW 320d', 2020, 79000, 'diesel', 'automatic', 'sedan', '70.00',
     'Drejtim sportiv dhe i qëndrueshëm, me kambio automatike 8-shpejtësi.'),
    ('Toyota Corolla Hybrid', 2023, 18000, 'hybrid', 'automatic', 'sedan', '45.00',
     'Hibride e qetë dhe ekonomike, me sisteme moderne sigurie.'),
    ('Dacia Duster', 2022, 39000, 'diesel', 'manual', 'suv', '40.00',
     'SUV praktik për rrugë malore dhe fshatra, me tërheqje 4x4.'),
    ('Hyundai Tucson', 2022, 35000, 'hybrid', 'automatic', 'suv', '60.00',
     'SUV i gjerë dhe i pajisur mirë, ideal për pushime familjare.'),
    ('Kia Sportage', 2021, 52000, 'diesel', 'automatic', 'suv', '58.00',
     'Hapësirë e bollshme dhe kamera pas, e lehtë për t’u drejtuar.'),
    ('Volkswagen Tiguan', 2020, 71000, 'diesel', 'automatic', 'suv', '62.00',
     'SUV i fuqishëm dhe i rehatshëm për udhëtime drejt jugut.'),
    ('Land Rover Defender', 2021, 44000, 'diesel', 'automatic', 'suv', '140.00',
     'Për aventura në Thethi apo Valbonë, pa kompromis në komoditet.'),
    ('Tesla Model 3', 2022, 29000, 'electric', 'automatic', 'sedan', '85.00',
     'Elektrike me autonomi rreth 490 km dhe karikim të shpejtë.'),
    ('Volkswagen ID.4', 2023, 15000, 'electric', 'automatic', 'suv', '80.00',
     'SUV elektrik i heshtur dhe i gjerë, me kosto të ulët udhëtimi.'),
    ('Ford Mustang', 2019, 41000, 'petrol', 'automatic', 'coupe', '120.00',
     'Klasik amerikan V8 për një fundjavë të paharrueshme në bregdet.'),
    ('Mercedes-Benz Vito', 2020, 98000, 'diesel', 'manual', 'van', '90.00',
     'Furgon 8+1 vende, perfekt për grupe dhe transfertë nga aeroporti.'),
    ('Toyota Hilux', 2021, 67000, 'diesel', 'manual', 'truck', '75.00',
     'Pickup i fortë 4x4 për punë ose terren të vështirë.'),
]


class Command(BaseCommand):
    help = 'Create or update the fictional demo fleet. Safe to run more than once.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--owner',
            help='Username of the admin who manages the demo cars (default: first admin user).',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        owner = self.get_owner(options.get('owner'))

        created_count = 0
        for model, year, km, fuel, transmission, car_type, price, description in DEMO_CARS:
            _, created = Car.objects.update_or_create(
                owner=owner,
                model=model,
                year=year,
                defaults={
                    'km': km,
                    'fuel_type': fuel,
                    'transmission_type': transmission,
                    'type': car_type,
                    'price_per_day': Decimal(price),
                    'description': description,
                },
            )
            if created:
                created_count += 1

        updated_count = len(DEMO_CARS) - created_count
        self.stdout.write(self.style.SUCCESS(
            f'Demo fleet ready for "{owner.username}": {created_count} created, {updated_count} updated.'
        ))

    def get_owner(self, username):
        if username:
            try:
                owner = CustomUser.objects.get(username=username)
            except CustomUser.DoesNotExist:
                raise CommandError(f'User "{username}" does not exist.')
            if owner.role != 'admin':
                raise CommandError(f'User "{username}" is not an admin.')
            return owner

        owner = CustomUser.objects.filter(role='admin').order_by('id').first()
        if owner is None:
            raise CommandError('No admin user found. Create one first or pass --owner.')
        return owner
