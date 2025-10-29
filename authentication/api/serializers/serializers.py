from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from captcha.models import CaptchaStore
from authentication.models import (
    Profile, SocialLinks, UserSettings, UserProfileImage
)


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
    captcha_0 = serializers.CharField(max_length=40, required=False,
                                      write_only=True)
    captcha_1 = serializers.CharField(max_length=10, required=False,
                                      write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm',
                  'first_name', 'last_name', 'captcha_0', 'captcha_1')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")

        # Validate CAPTCHA if provided
        captcha_key = attrs.get('captcha_0')
        captcha_value = attrs.get('captcha_1')

        if captcha_key and captcha_value:
            try:
                # current captcha instance
                cur_captcha = CaptchaStore.objects.get(hashkey=captcha_key)
                if cur_captcha.response.lower() != captcha_value.lower():
                    raise serializers.ValidationError(
                        {"captcha": "Invalid CAPTCHA"}
                    )

                cur_captcha.delete()  # Delete used CAPTCHA
            except CaptchaStore.DoesNotExist:
                raise serializers.ValidationError(
                    {"captcha": "CAPTCHA has expired or is invalid"}
                )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data.pop('captcha_0', None)
        validated_data.pop('captcha_1', None)
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()
    captcha_0 = serializers.CharField(max_length=40, required=False,
                                      write_only=True)
    captcha_1 = serializers.CharField(max_length=10, required=False,
                                      write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Validate CAPTCHA first if provided
            captcha_key = attrs.get('captcha_0')
            captcha_value = attrs.get('captcha_1')

            if captcha_key and captcha_value:
                try:
                    cur_captcha = CaptchaStore.objects.get(hashkey=captcha_key)
                    if cur_captcha.response.lower() != captcha_value.lower():
                        raise serializers.ValidationError(
                            {"captcha": "Invalid CAPTCHA"}
                        )

                    cur_captcha.delete()  # Delete used CAPTCHA
                except CaptchaStore.DoesNotExist:
                    raise serializers.ValidationError(
                        {"captcha": "CAPTCHA has expired or is invalid"}
                    )

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
        exclude = ('profile', 'created_at', 'updated_at')
        read_only_fields = ('id',)


class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for User Settings"""
    class Meta:
        model = UserSettings
        exclude = ('user',)
        read_only_fields = ('id',)


class UserProfileImageSerializer(serializers.ModelSerializer):
    """Serializer for User Profile Image"""
    class Meta:
        model = UserProfileImage
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model - Read operations"""
    user = UserSerializer(read_only=True)
    social_links = serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'title', 'bio', 'country', 'city', 'experience',
                  'cloudinary_image_url', 'optimized_image_url', 'social_links', 
                  'settings', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def get_social_links(self, obj):
        try:
            social = obj.social_media.first()
            return SocialLinksSerializer(social).data if social else {}
        except:
            return {}
    
    def get_settings(self, obj):
        try:
            settings = UserSettings.objects.get(user=obj.user)
            return UserSettingsSerializer(settings).data
        except UserSettings.DoesNotExist:
            return {}


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Profile model"""
    social_links = SocialLinksSerializer(required=False)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False, read_only=True)
    
    class Meta:
        model = Profile
        fields = ('title', 'bio', 'country', 'city', 'experience', 
                  'first_name', 'last_name', 'email', 'social_links')
    
    def update(self, instance, validated_data):
        # Update user fields
        user_data = validated_data.pop('user', {})
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        
        # Update social links
        social_data = validated_data.pop('social_links', None)
        if social_data:
            social_links, _ = SocialLinks.objects.get_or_create(profile=instance)
            for attr, value in social_data.items():
                setattr(social_links, attr, value)
            social_links.save()
        
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password1 = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password2 = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password1'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password2": "Passwords do not match."})
        
        # Check if new password is different from old
        if attrs['old_password'] == attrs['new_password1']:
            raise serializers.ValidationError(
                {"new_password1": "New password must be different from current password."}
            )
        
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password1'])
        user.save()
        return user
