from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from app.serializers.about_serializer import AboutPageSerializer


class AboutAPIView(APIView):
    """API view for the About page data"""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """Handle GET request to retrieve about page data"""
        serializer = AboutPageSerializer()
        return Response(serializer.data, status=status.HTTP_200_OK)
