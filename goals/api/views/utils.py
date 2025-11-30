"""
Additional API views for goals utilities
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from goals.utils.statistics import get_reminders
from goals.api.serializers.goal_serializers import GoalListSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reminders_view(request):
    """
    Get goals that need check-ins today
    
    Returns:
        List of goals needing check-ins
    """
    goals_needing_checkin = get_reminders(request.user)
    serializer = GoalListSerializer(goals_needing_checkin, many=True)
    
    return Response({
        'count': goals_needing_checkin.count(),
        'goals': serializer.data
    })
