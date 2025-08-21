from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_test(request):
    """Simple API test endpoint"""
    return Response({'message': 'Django REST Framework is working!'})


app_name = 'authentication_api'

urlpatterns = [
    path('test/', api_test, name='api_test'),
]
