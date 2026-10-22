from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Car
from .images import ImageRejected, process_car_image
from .serializers import CarSerializer, AdminCarSerializer, CatalogCarSerializer, CatalogQuerySerializer
from .permissions import IsOwnerOrAdmin
from users.models import CustomUser


class CarPagination(PageNumberPagination):
    page_size = 10


class OwnerPagination(PageNumberPagination):
    page_size = 3


class CatalogPagination(PageNumberPagination):
    page_size = 9


class AdminCarCreateView(APIView):
    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        serializer = AdminCarSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            owner = get_object_or_404(CustomUser, pk=data['owner_id']) if 'owner_id' in data else request.user
            car = Car.objects.create(
                model=data['model'],
                year=data['year'],
                km=data['km'],
                fuel_type=data['fuel_type'],
                transmission_type=data['transmission_type'],
                type=data['type'],
                price_per_day=data.get('price_per_day', Decimal('0.00')),
                description=data.get('description', ''),
                owner=owner
            )
            return Response(CarSerializer(car, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCarGroupedView(APIView):
    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        search = request.query_params.get('search', '')
        cars_qs = Car.objects.all()
        if search:
            cars_qs = cars_qs.filter(model__icontains=search)
        owner_ids = list(
            cars_qs.order_by('owner_id').values_list('owner_id', flat=True).distinct()
        )
        paginator = OwnerPagination()
        page_owner_ids = paginator.paginate_queryset(owner_ids, request)
        cars = cars_qs.filter(owner_id__in=page_owner_ids).order_by('owner_id')
        serializer = CarSerializer(cars, many=True)
        return paginator.get_paginated_response(serializer.data)


class CarView(APIView):
    def get(self, request):
        search = request.query_params.get('search', '')
        if request.user.role == 'admin':
            cars = Car.objects.all()
        else:
            cars = Car.objects.filter(owner=request.user)
        if search:
            cars = cars.filter(model__icontains=search)
        paginator = CarPagination()
        result_page = paginator.paginate_queryset(cars, request)
        serializer = CarSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


    def post(self, request):
        # The fleet is managed by admins (see AdminCarCreateView); customers no longer add cars
        if request.user.role != 'admin':
            return Response({"error": "Only admins can add cars."}, status=status.HTTP_403_FORBIDDEN)
        serializer = CarSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            car = Car.objects.create(
                model=data['model'],
                year=data['year'],
                km=data['km'],
                fuel_type=data['fuel_type'],
                transmission_type=data['transmission_type'],
                type=data['type'],
                price_per_day=data.get('price_per_day', Decimal('0.00')),
                description=data.get('description', ''),
                owner=request.user
            )
            return Response(CarSerializer(car).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CarDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get(self, request, pk):
        car = get_object_or_404(Car, pk=pk)
        self.check_object_permissions(request, car)
        serializer = CarSerializer(car, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        car = get_object_or_404(Car, pk=pk)
        self.check_object_permissions(request, car)
        serializer = CarSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            for field, value in data.items():
                setattr(car, field, value)
            car.save()
            return Response(CarSerializer(car, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        car = get_object_or_404(Car, pk=pk)
        self.check_object_permissions(request, car)
        car.image.delete(save=False)
        car.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def catalog_cars():
    # Cars without a price (e.g. old customer cars) are not offered for rent
    return Car.objects.filter(price_per_day__gt=0)


class CatalogListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        query = CatalogQuerySerializer(data=request.query_params)
        if not query.is_valid():
            return Response(query.errors, status=status.HTTP_400_BAD_REQUEST)
        filters = query.validated_data

        cars = catalog_cars()
        if filters.get('search'):
            cars = cars.filter(model__icontains=filters['search'])
        if 'type' in filters:
            cars = cars.filter(type=filters['type'])
        if 'fuel' in filters:
            cars = cars.filter(fuel_type=filters['fuel'])
        if 'transmission' in filters:
            cars = cars.filter(transmission_type=filters['transmission'])
        if 'min_price' in filters:
            cars = cars.filter(price_per_day__gte=filters['min_price'])
        if 'max_price' in filters:
            cars = cars.filter(price_per_day__lte=filters['max_price'])
        # id as tie-breaker keeps pagination stable
        cars = cars.order_by(filters.get('ordering', 'price_per_day'), 'id')

        paginator = CatalogPagination()
        result_page = paginator.paginate_queryset(cars, request)
        serializer = CatalogCarSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class CatalogDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, pk):
        car = get_object_or_404(catalog_cars(), pk=pk)
        return Response(CatalogCarSerializer(car, context={'request': request}).data)


class CarImageView(APIView):
    """Admin uploads (POST, multipart field "image") or removes (DELETE) a car photo."""
    parser_classes = [MultiPartParser]

    def post(self, request, pk):
        if request.user.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        car = get_object_or_404(Car, pk=pk)
        upload = request.FILES.get('image')
        if upload is None:
            return Response({"image": ["No file was sent."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            image_file = process_car_image(upload)
        except ImageRejected as error:
            return Response({"image": [str(error)]}, status=status.HTTP_400_BAD_REQUEST)
        car.image.delete(save=False)
        car.image.save(image_file.name, image_file, save=True)
        return Response(CarSerializer(car, context={'request': request}).data)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        car = get_object_or_404(Car, pk=pk)
        car.image.delete(save=True)
        return Response(CarSerializer(car, context={'request': request}).data)
