from rest_framework import serializers
from captcha.models import CaptchaStore
from django.core.exceptions import ValidationError
from django.utils.text import slugify

from .models import Message, Projects, Image, Video


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for project images"""
    class Meta:
        model = Image
        fields = ('id', 'cloudinary_image_id', 'cloudinary_image_url', 'optimized_image_url', 'live')
        read_only_fields = ('id',)


class VideoSerializer(serializers.ModelSerializer):
    """Serializer for project videos"""
    class Meta:
        model = Video
        fields = ('id', 'youtube_url', 'thumbnail_url', 'live')
        read_only_fields = ('id', 'thumbnail_url')


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for reading projects"""
    images = ImageSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    first_image = serializers.SerializerMethodField()

    class Meta:
        model = Projects
        fields = (
            'id', 'title', 'description', 'project_type', 'category',
            'client', 'project_url', 'created_at', 'updated_at',
            'slug', 'live', 'images', 'videos', 'first_image'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'slug')

    def get_first_image(self, obj):
        first_image = obj.first_image
        if first_image:
            return ImageSerializer(first_image).data
        return None


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects"""

    class Meta:
        model = Projects
        fields = (
            'title', 'description', 'project_type', 'category',
            'client', 'project_url', 'live'
        )

    def create(self, validated_data):
        # Auto-generate slug from title
        validated_data['slug'] = slugify(validated_data['title'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update slug if title changes
        if 'title' in validated_data and validated_data['title'] != instance.title:
            validated_data['slug'] = slugify(validated_data['title'])
        return super().update(instance, validated_data)


class MessageSerializer(serializers.ModelSerializer):
    """ Serializer for the Message Model """
    class Meta:
        model = Message
        fields = ('id', 'name', 'subject', 'email',
                  'message', 'created_at', 'is_read')
        read_only_fields = ('id', 'created_at', 'is_read')


class ContactFormSerializer(serializers.Serializer):
    """ Serializer for contact form with CAPTCHA validation """
    name = serializers.CharField(max_length=50, min_length=5)
    email = serializers.EmailField(max_length=70)
    subject = serializers.CharField(max_length=150, min_length=15)
    message = serializers.CharField(max_length=1000, min_length=25)
    captcha_0 = serializers.CharField(max_length=40)  # CAPTCHA key
    captcha_1 = serializers.CharField(max_length=10)  # CAPTCHA value

    def validate(self, data):
        """Validate CAPTCHA"""
        captcha_key = data.get('captcha_0')
        captcha_value = data.get('captcha_1')

        if not captcha_key or not captcha_value:
            raise serializers.ValidationError("CAPTCHA is required")

        # Verify CAPTCHA
        try:
            captcha_instance = CaptchaStore.objects.get(hashkey=captcha_key)
            if captcha_instance.response.lower() != captcha_value.lower():
                raise serializers.ValidationError("Invalid CAPTCHA")
            # Delete used CAPTCHA
            captcha_instance.delete()
        except CaptchaStore.DoesNotExist:
            raise serializers.ValidationError("CAPTCHA has expired or is invalid")

        return data

    def save(self):
        """Save the message"""
        validated_data = self.validated_data
        message = Message.objects.create(
            name=validated_data['name'],
            email=validated_data['email'],
            subject=validated_data['subject'],
            message=validated_data['message']
        )
        return message
