"""
Validation utilities for goals and check-ins
"""
from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_date_range(start_date, end_date):
    """
    Validate that start_date is before or equal to end_date.
    
    Args:
        start_date: Start date
        end_date: End date
        
    Raises:
        ValidationError: If dates are invalid
    """
    if end_date and start_date > end_date:
        raise ValidationError(
            'Start date must be before or equal to end date.'
        )


def validate_checkin_date(goal, date):
    """
    Validate that check-in date is within goal's date range.
    
    Args:
        goal: Goal instance
        date: Check-in date
        
    Raises:
        ValidationError: If date is outside goal's range
    """
    if date < goal.start_date:
        raise ValidationError(
            'Check-in date cannot be before goal start date.'
        )
    
    if goal.target_date and date > goal.target_date:
        raise ValidationError(
            'Check-in date cannot be after goal target date.'
        )


def validate_unique_checkin(goal, date, checkin_id=None):
    """
    Validate that no duplicate check-in exists for the same date.
    
    Args:
        goal: Goal instance
        date: Check-in date
        checkin_id: Optional existing check-in ID (for updates)
        
    Raises:
        ValidationError: If duplicate check-in exists
    """
    from goals.models import CheckIn
    
    queryset = CheckIn.objects.filter(goal=goal, date=date)
    
    # Exclude current check-in if updating
    if checkin_id:
        queryset = queryset.exclude(id=checkin_id)
    
    if queryset.exists():
        raise ValidationError(
            f'A check-in already exists for {date}.'
        )


def validate_future_date(date, allow_future=False):
    """
    Validate that date is not in the future (unless allowed).
    
    Args:
        date: Date to validate
        allow_future: Whether to allow future dates
        
    Raises:
        ValidationError: If date is in future and not allowed
    """
    if not allow_future and date > timezone.now().date():
        raise ValidationError(
            'Date cannot be in the future.'
        )
