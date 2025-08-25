from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .views.api import (
    register_user,
    login_user,
    logout_user,
    user_profile,
    update_profile,
    UserListView,
    UserDetailView,
    ProfileListView,
    ProfileDetailView,
    LoginFormConfigView,
    RegisterFormConfigView
)
from .views.csrf import CSRFTokenView, get_csrf_token


@api_view(['GET'])
@permission_classes([AllowAny])
def api_test(request):
    """Simple API test endpoint"""
    return Response({'message': 'Django REST Framework is working!'})


app_name = 'authentication_api'

# DRF Router for ViewSets (if you add any later)
router = DefaultRouter()
# router.register(r'profiles', ProfileViewSet)

urlpatterns = [
    # Test endpoint
    path('test/', api_test, name='api_test'),

    # CSRF token endpoint
    path('csrf-token/', CSRFTokenView.as_view(), name='csrf_token'),

    # Form configuration endpoints
    path('login-form-config/', LoginFormConfigView.as_view(), name='login_form_config'),
    path('signup-form-config/', RegisterFormConfigView.as_view(), name='register_form_config'),

    # Authentication endpoints
    path('signup/', register_user, name='signup'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),

    # User profile endpoints
    path('profile/', user_profile, name='user_profile'),
    path('profile/update/', update_profile, name='update_profile'),

    # Admin endpoints
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),

    # Public profile endpoints
    path('profiles/', ProfileListView.as_view(), name='profile_list'),
    path('profiles/<slug:slug>/', ProfileDetailView.as_view(), name='profile_detail'),

    # Include router URLs
    path('', include(router.urls)),
]
