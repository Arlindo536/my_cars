from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    confirm_password = serializers.CharField()
    email =  serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()

def validate(self, data):
    if data['password'] != data['confirm_password']:
        raise serializers.ValidationError("Passwords do not match.")
    return data

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()
    confirm_new_password = serializers.CharField()

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError("New passwords do not match.")
        return data


class UpdateProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()


class AdminUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.ChoiceField(choices=[('admin', 'Admin'), ('customer', 'Customer')])