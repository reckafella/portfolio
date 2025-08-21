from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


@api_view(['GET'])
@permission_classes([AllowAny])
def api_test(request):
    """Simple API test endpoint"""
    return Response({'message': 'Django REST Framework is working!'})


@api_view(['POST'])
@permission_classes([AllowAny])
def simple_login(request):
    """Simple login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            'error': 'Username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            },
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def simple_register(request):
    """Simple registration endpoint"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    password_confirm = request.data.get('password_confirm')

    if not all([username, email, password, password_confirm]):
        return Response({
            'error': 'All fields are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if password != password_confirm:
        return Response({
            'error': 'Passwords do not match'
        }, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({
            'error': 'Username already exists'
        }, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'Email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', '')
        )

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            },
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def simple_logout(request):
    """Simple logout endpoint"""
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


app_name = 'authentication_api'

# DRF Router for ViewSets (if you add any later)
router = DefaultRouter()

urlpatterns = [
    # Test endpoint
    path('test/', api_test, name='api_test'),

    # Simple authentication endpoints
    path('login/', simple_login, name='simple_login'),
    path('signup/', simple_register, name='simple_register'),
    path('logout/', simple_logout, name='simple_logout'),

    # Include router URLs
    path('', include(router.urls)),
]
