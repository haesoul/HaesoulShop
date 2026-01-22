from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserAddress

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    username = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = User
        fields = ('email', 'password', 'username')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', validated_data['email']),
            # phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            is_verified=False  # По умолчанию не подтвержден
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_verified:
            raise serializers.ValidationError("Ваш email не подтвержден.")
        return data
    


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = (
            "id", "region", "city", "street",
            "house", "apartment", "postal_code", "is_default"
        )


class UserProfileSerializer(serializers.ModelSerializer):
    addresses = UserAddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "is_verified",
            "avatar",
            "addresses",
        )