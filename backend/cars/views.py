from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .models import Car
from .serializers import CarSerializer, AdminCarSerializer
from .permissions import IsOwnerOrAdmin
from users.models import CustomUser


class CarPagination(PageNumberPagination):
    page_size = 10


class OwnerPagination(PageNumberPagination):
    page_size = 3


class AdminCarCreateView(APIView):
    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        serializer = AdminCarSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            owner = get_object_or_404(CustomUser, pk=data['owner_id'])
            car = Car.objects.create(
                model=data['model'],
                year=data['year'],
                km=data['km'],
                fuel_type=data['fuel_type'],
                transmission_type=data['transmission_type'],
                type=data['type'],
                owner=owner
            )
            return Response(CarSerializer(car).data, status=status.HTTP_201_CREATED)
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
        serializer = CarSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


    def post(self, request):
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
                owner=request.user
            )
            return Response(CarSerializer(car).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CarDetailView(APIView):
    permission_classes = [IsOwnerOrAdmin]

    def get(self, request, pk):
        car = get_object_or_404(Car, pk=pk)
        self.check_object_permissions(request, car)
        serializer = CarSerializer(car)
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
            return Response(CarSerializer(car).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        car = get_object_or_404(Car, pk=pk)
        self.check_object_permissions(request, car)
        car.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)