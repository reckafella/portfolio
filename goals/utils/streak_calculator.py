"""
Streak calculation utilities for goal tracking
"""
from datetime import timedelta
from django.utils import timezone


def calculate_current_streak(goal):
    """
    Calculate the current consecutive success streak for a goal.
    Counts backwards from today until a failure/gap is found.
    
    Args:
        goal: Goal instance
        
    Returns:
        int: Current streak count (days)
    """
    from goals.models import CheckIn
    
    streak = 0
    current_date = timezone.now().date()
    
    # Don't count future dates or dates before goal start
    if current_date < goal.start_date:
        return 0
    
    # For goals with target_date, don't go past it
    end_date = goal.start_date
    if goal.target_date and current_date > goal.target_date:
        current_date = goal.target_date
    
    # Count backwards from current date
    while current_date >= end_date:
        try:
            checkin = CheckIn.objects.get(goal=goal, date=current_date)
            if checkin.status == 'SUCCESS':
                streak += 1
            else:
                # Failure or skipped breaks the streak
                break
        except CheckIn.DoesNotExist:
            # Missing check-in breaks the streak
            break
        
        # Move to previous day
        if goal.target_frequency == 'DAILY':
            current_date -= timedelta(days=1)
        elif goal.target_frequency == 'WEEKLY':
            current_date -= timedelta(days=7)
        else:
            # For custom frequency, treat as daily
            current_date -= timedelta(days=1)
    
    return streak


def calculate_longest_streak(goal):
    """
    Calculate the longest consecutive success streak in goal's history.
    
    Args:
        goal: Goal instance
        
    Returns:
        int: Longest streak count (days)
    """
    from goals.models import CheckIn
    
    checkins = CheckIn.objects.filter(goal=goal).order_by('date')
    
    if not checkins.exists():
        return 0
    
    max_streak = 0
    current_streak = 0
    previous_date = None
    
    for checkin in checkins:
        if checkin.status == 'SUCCESS':
            if previous_date is None:
                # First check-in
                current_streak = 1
            else:
                # Calculate expected gap based on frequency
                if goal.target_frequency == 'DAILY':
                    expected_gap = timedelta(days=1)
                elif goal.target_frequency == 'WEEKLY':
                    expected_gap = timedelta(days=7)
                else:
                    expected_gap = timedelta(days=1)
                
                # Check if this continues the streak
                actual_gap = checkin.date - previous_date
                if actual_gap == expected_gap:
                    current_streak += 1
                else:
                    # Gap detected, reset streak
                    current_streak = 1
            
            max_streak = max(max_streak, current_streak)
            previous_date = checkin.date
        else:
            # Failure or skip resets the streak
            current_streak = 0
            previous_date = checkin.date
    
    return max_streak


def get_streak_info(goal):
    """
    Get comprehensive streak information for a goal.
    
    Args:
        goal: Goal instance
        
    Returns:
        dict: Dictionary with current_streak and longest_streak
    """
    return {
        'current_streak': calculate_current_streak(goal),
        'longest_streak': calculate_longest_streak(goal),
    }
