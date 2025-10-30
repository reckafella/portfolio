from rest_framework import status, permissions

from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url

from authentication.authentication import (
    CsrfExemptSessionAuthentication,
    APITokenAuthentication
)

from authentication.api.serializers.serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
)
from authentication.forms.auth import LoginForm, SignupForm


class RegisterUserView(APIView):
    """Register a new user - Class-based view"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]

    def get(self, request):
        form = SignupForm()

        captcha = CaptchaStore.generate_key()
        captcha_url = captcha_image_url(captcha)

        fields = {}
        for name, field in form.fields.items():
            field_data = {
                "label": field.label,
                "type": field.widget.__class__.__name__,
                "required": field.required,
                "help_text": field.help_text,
                "disabled": field.disabled,
                "widget": field.widget.__class__.__name__,
                "max_length": field.max_length if hasattr(field, 'max_length') else None,
                "min_length": field.min_length if hasattr(field, 'min_length') else None,
            }
            if name == "captcha":
                field_data["captcha_key"] = captcha
                field_data["captcha_image"] = request.build_absolute_uri(captcha_url)

            fields[name] = field_data

        return Response({"fields": fields}, status=status.HTTP_200_OK)

    def post(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # Log the user in (creates session)
            login(request, user)
            
            messages = ['User registered successfully.']
            if created:
                messages += [
                    'Valid authentication token created.'
                ]
            
            # Create response without token in body
            response = Response({
                'user': UserSerializer(user).data,
                'message': ' '.join(messages)
            }, status=status.HTTP_201_CREATED)
            
            # Set token in httpOnly cookie
            response.set_cookie(
                key='auth_token',
                value=token.key,
                httponly=True,
                secure=request.is_secure(),  # True in production (HTTPS), False in dev
                samesite='Lax',
                max_age=28800,  # 8 hours, matching session age
            )
            
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginUserView(APIView):
    """Login user - Class-based view"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]

    def get(self, request):
        form = LoginForm()

        captcha = CaptchaStore.generate_key()
        captcha_url = captcha_image_url(captcha)

        fields = {}
        for name, field in form.fields.items():
            field_data = {
                "label": field.label,
                "type": field.widget.__class__.__name__,
                "required": field.required,
                "help_text": field.help_text,
                "disabled": field.disabled,
                "widget": field.widget.__class__.__name__,
                "max_length": field.max_length if hasattr(field, 'max_length') else None,
                "min_length": field.min_length if hasattr(field, 'min_length') else None,
            }
            if name == "captcha":
                field_data["captcha_key"] = captcha
                field_data["captcha_image"] = request.build_absolute_uri(captcha_url)

            fields[name] = field_data

        return Response({"fields": fields}, status=status.HTTP_200_OK)

    def post(self, request):
        """Login user"""
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)

            messages = ['Login successful']
            if created:
                messages.append('Authentication token created.')
            
            # Create response without token in body
            response = Response({
                'user': UserSerializer(user).data,
                'message': ' '.join(messages)
            }, status=status.HTTP_200_OK)
            
            # Set token in httpOnly cookie
            response.set_cookie(
                key='auth_token',
                value=token.key,
                httponly=True,
                secure=request.is_secure(),  # True in production (HTTPS), False in dev
                samesite='Lax',
                max_age=28800,  # 8 hours, matching session age
            )
            
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutUserView(APIView):
    """Logout user - Class-based view"""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]
    messages = ['Logout Successful']

    def post(self, request) -> Response:
        """Logout user"""
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            self.messages.append('Authentication token deleted successfully.')
        except (AttributeError, Token.DoesNotExist):
            self.messages.append('No authentication token found!')
            pass
        
        logout(request)
        
        # Create response
        response = Response({
            'message': ' '.join(self.messages)
        }, status=status.HTTP_200_OK)
        
        # Delete the auth_token cookie
        response.delete_cookie('auth_token')
        
        return response
