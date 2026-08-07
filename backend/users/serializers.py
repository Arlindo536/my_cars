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

