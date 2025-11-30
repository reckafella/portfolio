"""
Statistics and analytics utilities for goals
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q


def calculate_success_rate(goal, period=None):
    """
    Calculate success rate for a goal.
    
    Args:
        goal: Goal instance
        period: Optional period filter ('week', 'month', 'all')
        
    Returns:
        float: Success rate as percentage (0-100)
    """
    from goals.models import CheckIn
    
    queryset = CheckIn.objects.filter(goal=goal)
    
    # Filter by period if specified
    if period == 'week':
        start_date = timezone.now().date() - timedelta(days=7)
        queryset = queryset.filter(date__gte=start_date)
    elif period == 'month':
        start_date = timezone.now().date() - timedelta(days=30)
        queryset = queryset.filter(date__gte=start_date)
    
    total_checkins = queryset.count()
    if total_checkins == 0:
        return 0.0
    
    successful_checkins = queryset.filter(status='SUCCESS').count()
    return round((successful_checkins / total_checkins) * 100, 2)


def get_checkin_history(goal, days=30):
    """
    Get recent check-in history for a goal.
    
    Args:
        goal: Goal instance
        days: Number of days to retrieve (default: 30)
        
    Returns:
        list: List of check-in dictionaries with date and status
    """
    from goals.models import CheckIn
    
    end_date = timezone.now().date()
    start_date = max(goal.start_date, end_date - timedelta(days=days))
    
    # Get all check-ins in the range
    checkins = CheckIn.objects.filter(
        goal=goal,
        date__gte=start_date,
        date__lte=end_date
    ).order_by('-date')
    
    # Create a map of dates to check-ins
    checkin_map = {c.date: c for c in checkins}
    
    # Build complete history including missing days
    history = []
    current_date = end_date
    
    while current_date >= start_date:
        if current_date in checkin_map:
            checkin = checkin_map[current_date]
            history.append({
                'date': current_date,
                'status': checkin.status,
                'notes': checkin.notes,
                'id': checkin.id
            })
        else:
            history.append({
                'date': current_date,
                'status': None,
                'notes': None,
                'id': None
            })
        current_date -= timedelta(days=1)
    
    return history


def get_weekly_summary(goal):
    """
    Get weekly summary statistics for a goal.
    
    Returns:
        dict: Weekly statistics
    """
    from goals.models import CheckIn
    
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    checkins = CheckIn.objects.filter(
        goal=goal,
        date__gte=week_start,
        date__lte=today
    )
    
    summary = checkins.aggregate(
        total=Count('id'),
        successes=Count('id', filter=Q(status='SUCCESS')),
        failures=Count('id', filter=Q(status='FAILURE')),
        skipped=Count('id', filter=Q(status='SKIPPED'))
    )
    
    return {
        'week_start': week_start,
        'week_end': today,
        'total_checkins': summary['total'],
        'successes': summary['successes'],
        'failures': summary['failures'],
        'skipped': summary['skipped'],
    }


def get_monthly_summary(goal):
    """
    Get monthly summary statistics for a goal.
    
    Returns:
        dict: Monthly statistics
    """
    from goals.models import CheckIn
    
    today = timezone.now().date()
    month_start = today.replace(day=1)
    
    checkins = CheckIn.objects.filter(
        goal=goal,
        date__gte=month_start,
        date__lte=today
    )
    
    summary = checkins.aggregate(
        total=Count('id'),
        successes=Count('id', filter=Q(status='SUCCESS')),
        failures=Count('id', filter=Q(status='FAILURE')),
        skipped=Count('id', filter=Q(status='SKIPPED'))
    )
    
    return {
        'month_start': month_start,
        'month_end': today,
        'total_checkins': summary['total'],
        'successes': summary['successes'],
        'failures': summary['failures'],
        'skipped': summary['skipped'],
    }


def get_reminders(user):
    """
    Get goals that need check-ins today.
    
    Args:
        user: User instance
        
    Returns:
        QuerySet: Goals needing check-ins
    """
    from goals.models import Goal, CheckIn
    
    today = timezone.now().date()
    
    # Get active goals for user
    active_goals = Goal.objects.filter(
        user=user,
        is_active=True,
        start_date__lte=today
    )
    
    # If goal has target_date, exclude if passed
    active_goals = active_goals.filter(
        Q(target_date__isnull=True) | Q(target_date__gte=today)
    )
    
    # Find goals without today's check-in
    goals_needing_checkin = []
    for goal in active_goals:
        has_checkin = CheckIn.objects.filter(
            goal=goal,
            date=today
        ).exists()
        
        if not has_checkin:
            goals_needing_checkin.append(goal.id)
    
    return Goal.objects.filter(id__in=goals_needing_checkin)
