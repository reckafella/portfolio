from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url

from ..authentication import CsrfExemptSessionAuthentication, APITokenAuthentication

from ..serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer
)
from ..models import Profile
from ..forms.auth import LoginForm, SignupForm


class LoginFormConfigView(APIView):
    """API endpoint to return login form configuration"""
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


class RegisterFormConfigView(APIView):
    """API endpoint to return registration form configuration"""
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
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
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
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutUserView(APIView):
    """Logout user - Class-based view"""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]

    def post(self, request):
        """Logout user"""
        try:
            # Delete the user's token
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist):
            pass
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Get current user's profile"""
    try:
        profile = request.user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({
            'error': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """Update current user's profile"""
    try:
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Profile.DoesNotExist:
        return Response({
            'error': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


class UserListView(generics.ListAPIView):
    """List all users (staff only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a user (staff only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class ProfileListView(generics.ListAPIView):
    """List all profiles (public)"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]


class ProfileDetailView(generics.RetrieveAPIView):
    """Retrieve a specific profile by slug (public)"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
