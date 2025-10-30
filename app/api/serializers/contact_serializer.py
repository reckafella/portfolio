from rest_framework import serializers
from captcha.models import CaptchaStore

from app.models import Message


class ContactFormSerializer(serializers.ModelSerializer):
    """
    Serializer for contact form with CAPTCHA validation
    """
    captcha_0 = serializers.CharField(max_length=40, write_only=True)  # CAPTCHA key
    captcha_1 = serializers.CharField(max_length=10, write_only=True)  # CAPTCHA value

    class Meta:
        model = Message
        fields = ('id', 'name', 'subject', 'email',
                  'message', 'created_at', 'is_read', 'captcha_0', 'captcha_1')
        read_only_fields = ('id', 'created_at', 'is_read')
        extra_kwargs = {
            'name': {'max_length': 50, 'min_length': 5},
            'email': {'max_length': 70},
            'subject': {'max_length': 150, 'min_length': 15},
            'message': {'max_length': 1000, 'min_length': 25}
        }

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
