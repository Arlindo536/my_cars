from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer, ChangePasswordSerializer, UpdateProfileSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError


class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = CustomUser(
                username=data['username'],
                email=data['email'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            user.set_password(data['password'])
            try:
                user.save()
            except IntegrityError:
                return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data = request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = authenticate(username=data['username'], password=data['password'])
            if user is not None :
                token, created = Token.objects.get_or_create(user=user)
                return Response({"username": user.username,"role":user.role,"token":token.key})
            else :
                return Response({"error":"Invalid credentails"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        users = CustomUser.objects.all()
        data = [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users]
        return Response(data)

class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = request.user
            if not user.check_password(data['old_password']):
                return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(data['new_password'])
            user.save()
            return Response({"message": "Password changed successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(APIView):
    def put(self, request):
        serializer = UpdateProfileSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = request.user
            user.first_name = data['first_name']
            user.last_name = data['last_name']
            user.email = data['email']
            user.save()
            return Response({"message": "Profile updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)