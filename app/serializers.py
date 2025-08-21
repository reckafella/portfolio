from rest_framework import serializers
from captcha.models import CaptchaStore
from django.core.exceptions import ValidationError

from .models import Message


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
