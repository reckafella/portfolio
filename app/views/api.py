from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import MessageSerializer
# from ..models import Message


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def contact(request):
    """ Save message received from website users """
    serializer = MessageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Message Received Successfully'
            }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
