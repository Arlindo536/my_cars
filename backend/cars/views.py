from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Car, CarImage
from .serializers import CarSerializer, AdminCarSerializer, CarImageSerializer
from .permissions import IsOwnerOrAdmin, user_can_manage_car
from users.models import CustomUser

MAX_IMAGES_PER_CAR = 8
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp'}


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
        cars = cars_qs.filter(owner_id__in=page_owner_ids).order_by('owner_id').prefetch_related('images')
        serializer = CarSerializer(cars, many=True, context={'request': request})
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
        cars = cars.prefetch_related('images')
        paginator = CarPagination()
        result_page = paginator.paginate_queryset(cars, request)
        serializer = CarSerializer(result_page, many=True, context={'request': request})
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
            return Response(CarSerializer(car, context={'request': request}).data, status=status.HTTP_201_CREATED)
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
        car.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CarImageListCreateView(APIView):
    """List a car's images or upload a new one. Owner of the car or an admin only."""
    parser_classes = [MultiPartParser, FormParser]

    def _get_car(self, request, car_pk):
        car = get_object_or_404(Car, pk=car_pk)
        if not user_can_manage_car(request, car):
            return None
        return car

    def get(self, request, car_pk):
        car = self._get_car(request, car_pk)
        if car is None:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        images = car.images.all()
        return Response(CarImageSerializer(images, many=True, context={'request': request}).data)

    def post(self, request, car_pk):
        car = self._get_car(request, car_pk)
        if car is None:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        if car.images.count() >= MAX_IMAGES_PER_CAR:
            return Response(
                {"error": f"You can upload at most {MAX_IMAGES_PER_CAR} images per car."},
                status=status.HTTP_400_BAD_REQUEST
            )

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)
        if image_file.content_type not in ALLOWED_IMAGE_TYPES:
            return Response({"error": "Only JPG, PNG or WEBP images are allowed."}, status=status.HTTP_400_BAD_REQUEST)
        if image_file.size > MAX_IMAGE_SIZE:
            return Response({"error": "Image must be smaller than 5MB."}, status=status.HTTP_400_BAD_REQUEST)

        is_first = not car.images.exists()
        image = CarImage.objects.create(car=car, image=image_file, is_primary=is_first)
        return Response(CarImageSerializer(image, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CarImageDetailView(APIView):
    """Delete an image, or PATCH it to set it as the car's primary photo."""

    def _get_car_and_image(self, request, car_pk, image_pk):
        car = get_object_or_404(Car, pk=car_pk)
        if not user_can_manage_car(request, car):
            return None, None
        image = get_object_or_404(CarImage, pk=image_pk, car=car)
        return car, image

    def patch(self, request, car_pk, image_pk):
        car, image = self._get_car_and_image(request, car_pk, image_pk)
        if car is None:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        if image is None:
            return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)
        car.images.filter(is_primary=True).update(is_primary=False)
        image.is_primary = True
        image.save()
        return Response(CarImageSerializer(image, context={'request': request}).data)

    def delete(self, request, car_pk, image_pk):
        car, image = self._get_car_and_image(request, car_pk, image_pk)
        if car is None:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        if image is None:
            return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)
        was_primary = image.is_primary
        image.image.delete(save=False)
        image.delete()
        if was_primary:
            next_image = car.images.first()
            if next_image:
                next_image.is_primary = True
                next_image.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
