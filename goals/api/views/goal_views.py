"""
API views for Goal model
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return goals for current user only, with optional filtering"""
        queryset = Goal.objects.filter(user=self.request.user)
        
        # Apply filters from query parameters
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        goal_type = self.request.query_params.get('goal_type')
        if goal_type:
            queryset = queryset.filter(goal_type=goal_type)
        
        target_frequency = self.request.query_params.get('target_frequency')
        if target_frequency:
            queryset = queryset.filter(target_frequency=target_frequency)
        
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset
    
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
