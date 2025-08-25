from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from django.http import JsonResponse

from ..serializers import MessageSerializer, ContactFormSerializer
from ..forms.contact import ContactForm
# from ..models import Message


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def captcha_refresh(request):
    """Generate new CAPTCHA challenge"""
    # Create new CAPTCHA
    captcha = CaptchaStore.generate_key()
    captcha_url = captcha_image_url(captcha)

    return Response({
        'captcha_key': captcha,
        'captcha_image': request.build_absolute_uri(captcha_url)
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def contact(request):
    """ Save message received from website users """
    serializer = MessageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Message Received Successfully'
            }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactFormAPIView(APIView):
    """ API View for handling contact form submissions """
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
            }

            if getattr(field, "max_length", None):
                field_data["max_length"] = field.max_length

            # Add CAPTCHA specific data
            if name == 'captcha':
                field_data["captcha_key"] = captcha
                field_data["captcha_image"] = request.build_absolute_uri(captcha_url)

            fields[name] = field_data

        return Response({"fields": fields}, status=status.HTTP_200_OK)

    def post(self, request):
        print(f"Contact form POST data: {request.data}")  # Debug line
        serializer = ContactFormSerializer(data=request.data)

        if serializer.is_valid():
            message = serializer.save()
            return Response({
                'message': 'Message Received Successfully',
                'id': message.id
            }, status=status.HTTP_201_CREATED)

        print(f"Contact form validation errors: {serializer.errors}")  # Debug line
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
