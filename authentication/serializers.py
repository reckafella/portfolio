from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile, SocialLinks, UserSettings, UserProfileImage


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'date_joined', 'is_staff')
        read_only_fields = ('id', 'date_joined', 'is_staff')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')

        return attrs


class SocialLinksSerializer(serializers.ModelSerializer):
    """Serializer for Social Links"""
    class Meta:
        model = SocialLinks
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for User Settings"""
    class Meta:
        model = UserSettings
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class UserProfileImageSerializer(serializers.ModelSerializer):
    """Serializer for User Profile Image"""
    class Meta:
        model = UserProfileImage
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model"""
    user = UserSerializer(read_only=True)
    social_links = SocialLinksSerializer(read_only=True)
    user_settings = UserSettingsSerializer(read_only=True)
    user_profile_image = UserProfileImageSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('id', 'user', 'slug', 'created_at', 'updated_at')


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Profile model"""
    class Meta:
        model = Profile
        fields = ('bio', 'location', 'website', 'github', 'linkedin', 'twitter')
