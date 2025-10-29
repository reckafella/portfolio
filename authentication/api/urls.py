from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from authentication.api.views.auth import (
    RegisterUserView,
    LoginUserView,
    LogoutUserView
)
from authentication.api.views.profile import (
    UserProfileView,
    UserListView,
    UserDetailView,
    ProfileListView,
    ProfileDetailView,
    PasswordChangeView,
    UserSettingsView,
)
from authentication.views.csrf import CSRFTokenView


@api_view(['GET'])
@permission_classes([AllowAny])
def api_test(request):
    """Simple API test endpoint"""
    user = request.user.username
    message = f"Hello, {user or 'user'}. Django REST Framework is working!"
    return Response({'message': message})


app_name = 'authentication_api'

# DRF Router for ViewSets (if you add any later)
router = DefaultRouter()
# router.register(r'profiles', ProfileViewSet)

# Form configuration endpoints
"""
path('login-form-config/', LoginFormConfigView.as_view(), name='login_form_config'),
path('signup-form-config/', RegisterFormConfigView.as_view(), name='register_form_config'),
"""

urlpatterns = [
    # Test endpoint
    path('test/', api_test, name='api_test'),

    # CSRF token endpoint
    path('csrf-token/', CSRFTokenView.as_view(), name='csrf_token'),

    # Authentication endpoints
    path('signup/', RegisterUserView.as_view(), name='signup'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),

    # User profile endpoints
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/password/', PasswordChangeView.as_view(), name='change_password'),
    path('profile/settings/', UserSettingsView.as_view(), name='user_settings'),

    # Admin endpoints
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),

    # Public profile endpoints
    path('profiles/', ProfileListView.as_view(), name='profile_list'),
    path('profiles/<slug:slug>/', ProfileDetailView.as_view(), name='profile_detail'),

    # Include router URLs
    path('', include(router.urls)),
]
