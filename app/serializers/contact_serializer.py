from rest_framework import serializers
from captcha.models import CaptchaStore
from app.views.helpers.cloudinary import CloudinaryImageHandler

from app.models import Message

uploader = CloudinaryImageHandler()


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

    def validate(self, attrs):
        """Validate CAPTCHA"""
        captcha_key = attrs.get('captcha_0')
        captcha_value = attrs.get('captcha_1')

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

        return attrs

    def save(self, *args, **kwargs) -> Message | None:
        """Save the message"""
        validated_data = getattr(self, 'validated_data', {})
        if validated_data:
            message = Message.objects.create(
                name=validated_data.get('name'),
                email=validated_data.get('email'),
                subject=validated_data.get('subject'),
                message=validated_data.get('message')
            )
            return message
