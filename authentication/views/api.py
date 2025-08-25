from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from ..authentication import CsrfExemptSessionAuthentication, APITokenAuthentication

from ..serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer
)
from ..models import Profile


@method_decorator(csrf_exempt, name='dispatch')
class LoginFormConfigView(APIView):
    """API endpoint to return login form configuration"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]
    
    def get(self, request):
        form_config = {
            "fields": {
                "username": {
                    "label": "Username",
                    "type": "TextInput",
                    "required": True,
                    "help_text": "Enter your username",
                    "disabled": False,
                    "widget": "TextInput",
                    "max_length": 150
                },
                "password": {
                    "label": "Password",
                    "type": "PasswordInput",
                    "required": True,
                    "help_text": "Enter your password",
                    "disabled": False,
                    "widget": "PasswordInput"
                }
            }
        }
        return Response(form_config)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterFormConfigView(APIView):
    """API endpoint to return registration form configuration"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]
    
    def get(self, request):
        form_config = {
            "fields": {
                "first_name": {
                    "label": "First Name",
                    "type": "TextInput",
                    "required": False,
                    "help_text": "Your first name",
                    "disabled": False,
                    "widget": "TextInput",
                    "max_length": 30
                },
                "last_name": {
                    "label": "Last Name",
                    "type": "TextInput",
                    "required": False,
                    "help_text": "Your last name",
                    "disabled": False,
                    "widget": "TextInput",
                    "max_length": 30
                },
                "username": {
                    "label": "Username",
                    "type": "TextInput",
                    "required": True,
                    "help_text": "Choose a unique username",
                    "disabled": False,
                    "widget": "TextInput",
                    "max_length": 150
                },
                "email": {
                    "label": "Email Address",
                    "type": "EmailInput",
                    "required": True,
                    "help_text": "Enter a valid email address",
                    "disabled": False,
                    "widget": "EmailInput",
                    "max_length": 254
                },
                "password": {
                    "label": "Password",
                    "type": "PasswordInput",
                    "required": True,
                    "help_text": "Password must be at least 8 characters",
                    "disabled": False,
                    "widget": "PasswordInput",
                    "min_length": 8
                },
                "password_confirm": {
                    "label": "Confirm Password",
                    "type": "PasswordInput",
                    "required": True,
                    "help_text": "Enter your password again",
                    "disabled": False,
                    "widget": "PasswordInput"
                }
            }
        }
        return Response(form_config)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication, APITokenAuthentication])
@csrf_exempt
def register_user(request):
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


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication, APITokenAuthentication])
@csrf_exempt
def login_user(request):
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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
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
