"""
API views for message inbox management
"""
from django.db.models import Q
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited

from app.models import Message
from app.api.serializers.messages_serializer import MessageSerializer


class StaffRequiredMixin:
    """Mixin to ensure only staff users can access the view"""

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Staff access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().dispatch(request, *args, **kwargs)


@method_decorator(ratelimit(key='user', rate='60/m', method='GET', block=True), name='dispatch')
class MessageListAPIView(StaffRequiredMixin, APIView):
    """
    List messages with filtering, search, and pagination
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get query parameters
            filter_type = request.GET.get('filter', 'all')
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))

            # Base queryset
            queryset = Message.objects.all().order_by('-created_at')

            # Apply filters
            if filter_type == 'unread':
                queryset = queryset.filter(is_read=False)
            elif filter_type == 'read':
                queryset = queryset.filter(is_read=True)

            # Apply search
            if search_query:
                queryset = queryset.filter(
                    Q(name__icontains=search_query) |
                    Q(email__icontains=search_query) |
                    Q(subject__icontains=search_query) |
                    Q(message__icontains=search_query)
                )

            # Pagination
            total_count = queryset.count()
            start = (page - 1) * page_size
            end = start + page_size
            messages = queryset[start:end]

            # Serialize
            serializer = MessageSerializer(messages, many=True)

            return Response({
                'success': True,
                'messages': serializer.data,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': total_count,
                    'total_pages': (total_count + page_size - 1) // page_size,
                    'has_next': end < total_count,
                    'has_previous': page > 1
                }
            })

        except Ratelimited:
            return Response(
                {'error': 'Rate limit exceeded'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='user', rate='60/m', method='GET', block=True), name='dispatch')
class MessageDetailAPIView(StaffRequiredMixin, APIView):
    """
    Get message detail and automatically mark as read
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)

            # Mark as read when viewing
            if not message.is_read:
                message.mark_as_read()

            serializer = MessageSerializer(message)
            return Response({
                'success': True,
                'message': serializer.data
            })

        except Message.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='user', rate='30/m', method='GET', block=True), name='dispatch')
class MessageStatsAPIView(StaffRequiredMixin, APIView):
    """
    Get inbox statistics
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            total_messages = Message.objects.count()
            unread_count = Message.objects.filter(is_read=False).count()
            read_count = Message.objects.filter(is_read=True).count()

            return Response({
                'success': True,
                'stats': {
                    'total_messages': total_messages,
                    'unread_count': unread_count,
                    'read_count': read_count
                }
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='user', rate='30/m', method='POST', block=True), name='dispatch')
class MarkMessageReadAPIView(StaffRequiredMixin, APIView):
    """
    Mark a message as read
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.mark_as_read()

            return Response({
                'success': True,
                'message': 'Message marked as read',
                'is_read': True
            })

        except Message.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='user', rate='30/m', method='POST', block=True), name='dispatch')
class MarkMessageUnreadAPIView(StaffRequiredMixin, APIView):
    """
    Mark a message as unread
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.is_read = False
            message.save()

            return Response({
                'success': True,
                'message': 'Message marked as unread',
                'is_read': False
            })

        except Message.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='user', rate='30/m', method='DELETE', block=True), name='dispatch')
class DeleteMessageAPIView(StaffRequiredMixin, APIView):
    """
    Delete a message
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.delete()

            return Response({
                'success': True,
                'message': 'Message deleted successfully'
            })

        except Message.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='user', rate='30/m', method='POST', block=True), name='dispatch')
class BulkMessageActionsAPIView(StaffRequiredMixin, APIView):
    """
    Perform bulk actions on messages
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            action = request.data.get('action')
            message_ids = request.data.get('message_ids', [])

            if not action or not message_ids:
                return Response(
                    {'error': 'Action and message_ids are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            messages = Message.objects.filter(id__in=message_ids)

            if action == 'mark_read':
                messages.update(is_read=True)
                return Response({
                    'success': True,
                    'message': f'{messages.count()} messages marked as read'
                })

            elif action == 'mark_unread':
                messages.update(is_read=False)
                return Response({
                    'success': True,
                    'message': f'{messages.count()} messages marked as unread'
                })

            elif action == 'delete':
                count = messages.count()
                messages.delete()
                return Response({
                    'success': True,
                    'message': f'{count} messages deleted'
                })

            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
