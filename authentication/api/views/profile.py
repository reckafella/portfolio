
from rest_framework import generics, permissions, status
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
# from rest_framework.decorators import api_view, permission_classes

from authentication.models import Profile
from authentication.api.serializers.serializers import (
    ProfileSerializer, ProfileUpdateSerializer, UserSerializer
)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get current user's profile"""
        try:
            profile = request.user.profile or self.request.user.profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({
                'error': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    # @api_view(['PUT', 'PATCH'])
    def post(self, request):
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
