from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url

from app.api.serializers.contact_serializer import ContactFormSerializer
from app.forms.contact import ContactForm


@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(ratelimit(key='ip', rate='5/h', method='POST', block=False), name='post')
class ContactPageAPIView(APIView):
    """ API View for handling contact form submissions with rate limiting """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Generate CAPTCHA for the form
        captcha = CaptchaStore.generate_key()
        captcha_url = captcha_image_url(captcha)

        form = ContactForm()
        fields = {}
        for name, field in form.fields.items():
            field_data = {
                "label": field.label,
                "type": field.widget.__class__.__name__,
                "required": getattr(field, "required", False),
                "help_text": getattr(field, "help_text", ""),
                "disabled": getattr(field, "disabled", False),
                "widget": field.widget.__class__.__name__,
                "max_length": field.max_length if hasattr(field, 'max_length') else None,
                "min_length": field.min_length if hasattr(field, 'min_length') else None,
            }

            # Add CAPTCHA specific data
            if name == 'captcha':
                field_data["captcha_key"] = captcha
                field_data["captcha_image"] = request.build_absolute_uri(captcha_url)

            fields[name] = field_data

        return Response({"fields": fields}, status=status.HTTP_200_OK)

    def post(self, request):
        # Check if rate limited
        if getattr(request, 'limited', False):
            return Response({
                'error': 'Too many contact form submissions. Please try again later.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        serializer = ContactFormSerializer(data=request.data)

        if serializer.is_valid():
            message = serializer.save()
            return Response({
                'messages': ['Message Received Successfully'],
                'id': message.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
