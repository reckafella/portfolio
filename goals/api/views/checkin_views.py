"""
API views for CheckIn model
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter

from goals.models import CheckIn, Goal
from goals.api.serializers.checkin_serializers import (
    CheckInSerializer,
    CheckInCreateSerializer
)
from goals.api.permissions import IsGoalOwner


class CheckInViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CheckIn CRUD operations
    
    Endpoints:
    - GET /api/goals/{goal_id}/checkins/ - List check-ins for a goal
    - POST /api/goals/{goal_id}/checkins/ - Create check-in
    - GET /api/checkins/{id}/ - Retrieve check-in
    - PATCH /api/checkins/{id}/ - Update check-in
    - DELETE /api/checkins/{id}/ - Delete check-in
    """
    permission_classes = [IsAuthenticated, IsGoalOwner]
    filter_backends = [OrderingFilter]
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    
    def get_queryset(self):
        """
        Return check-ins for goals owned by current user
        Optionally filter by goal_id if provided in URL
        """
        queryset = CheckIn.objects.filter(goal__user=self.request.user)
        
        # Filter by goal if goal_id is in URL kwargs
        goal_id = self.kwargs.get('goal_id')
        if goal_id:
            queryset = queryset.filter(goal_id=goal_id)
        
        # Apply filters from query parameters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        date_filter = self.request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(date=date_filter)
        
        return queryset
    
    def get_serializer_class(self):
        """Use create serializer for creation, standard for others"""
        if self.action == 'create':
            return CheckInCreateSerializer
        return CheckInSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new check-in
        Ensure goal belongs to current user
        """
        goal_id = kwargs.get('goal_id') or request.data.get('goal')
        
        # Verify goal exists and belongs to user
        try:
            goal = Goal.objects.get(id=goal_id, user=request.user)
        except Goal.DoesNotExist:
            return Response(
                {'error': 'Goal not found or you do not have permission to access it.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Add goal to data
        data = request.data.copy()
        data['goal'] = goal.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
