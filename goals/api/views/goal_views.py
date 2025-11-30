"""
API views for Goal model
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from goals.models import Goal
from goals.api.serializers.goal_serializers import (
    GoalSerializer,
    GoalListSerializer,
    GoalAnalyticsSerializer
)
from goals.api.permissions import IsOwner
from goals.utils.statistics import get_checkin_history


class GoalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Goal CRUD operations
    
    Endpoints:
    - GET /api/goals/ - List user's goals
    - POST /api/goals/ - Create new goal
    - GET /api/goals/{id}/ - Retrieve goal details
    - PATCH /api/goals/{id}/ - Update goal
    - DELETE /api/goals/{id}/ - Soft delete goal (set is_active=False)
    - GET /api/goals/{id}/analytics/ - Get detailed analytics
    """
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'category', 'goal_type', 'target_frequency']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return goals for current user only"""
        return Goal.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return GoalListSerializer
        return GoalSerializer
    
    def perform_create(self, serializer):
        """Auto-set user when creating goal"""
        serializer.save(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete - set is_active to False instead of deleting
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {'message': 'Goal archived successfully.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """
        Get detailed analytics for a goal
        
        Returns:
        - Current and longest streaks
        - Success rates (overall, weekly, monthly)
        - Weekly and monthly summaries
        - Recent check-in history
        """
        goal = self.get_object()
        
        # Serialize analytics data
        serializer = GoalAnalyticsSerializer(goal)
        
        # Add check-in history
        history = get_checkin_history(goal, days=30)
        
        return Response({
            'analytics': serializer.data,
            'checkin_history': history
        })
