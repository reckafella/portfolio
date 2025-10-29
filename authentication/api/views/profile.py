from rest_framework import generics, permissions, status
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from authentication.models import Profile, UserSettings
from authentication.api.serializers.serializers import (
    ProfileSerializer, ProfileUpdateSerializer, UserSerializer,
    UserSettingsSerializer, PasswordChangeSerializer
)
from authentication.authentication import (
    CsrfExemptSessionAuthentication, APITokenAuthentication
)


class UserProfileView(APIView):
    """Get and update current user's profile"""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        """Get current user's profile"""
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({
                'error': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        """Partially update current user's profile"""
        try:
            profile = request.user.profile
            serializer = ProfileUpdateSerializer(
                profile,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                # Return full profile data
                response_serializer = ProfileSerializer(profile)
                return Response({
                    'message': 'Profile updated successfully',
                    'profile': response_serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return Response({
                'error': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        """Fully update current user's profile"""
        try:
            profile = request.user.profile
            serializer = ProfileUpdateSerializer(
                profile,
                data=request.data,
                partial=False
            )
            if serializer.is_valid():
                serializer.save()
                # Return full profile data
                response_serializer = ProfileSerializer(profile)
                return Response({
                    'message': 'Profile updated successfully',
                    'profile': response_serializer.data
                }, status=status.HTTP_200_OK)
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
    queryset = Profile.objects.select_related('user').prefetch_related('social_media').all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]


class ProfileDetailView(generics.RetrieveAPIView):
    """Retrieve a specific profile by slug (public)"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class PasswordChangeView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # Update session to prevent logout
            update_session_auth_hash(request, request.user)
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserSettingsView(APIView):
    """Get and update user settings"""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, APITokenAuthentication]
    
    def get(self, request):
        """Get current user's settings"""
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """Update user settings"""
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(
            settings,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Settings updated successfully',
                'settings': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
