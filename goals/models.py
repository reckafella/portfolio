"""
Goal tracking models for personal goal management
"""
from django.contrib.auth.models import User
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


class Goal(models.Model):
    """
    Model representing a user's personal goal
    """
    GOAL_TYPE_CHOICES = [
        ('BUILD_HABIT', 'Build Habit'),
        ('QUIT_BEHAVIOR', 'Quit Behavior'),
    ]
    
    CATEGORY_CHOICES = [
        ('HEALTH', 'Health'),
        ('PRODUCTIVITY', 'Productivity'),
        ('SOCIAL', 'Social'),
        ('PERSONAL_DEVELOPMENT', 'Personal Development'),
        ('OTHER', 'Other'),
    ]
    
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('CUSTOM', 'Custom'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    goal_type = models.CharField(
        max_length=20,
        choices=GOAL_TYPE_CHOICES,
        default='BUILD_HABIT'
    )
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default='OTHER'
    )
    target_frequency = models.CharField(
        max_length=10,
        choices=FREQUENCY_CHOICES,
        default='DAILY'
    )
    start_date = models.DateField()
    target_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['start_date']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user.username})"
    
    def clean(self):
        """
        Validate that start_date is before target_date
        """
        if self.target_date and self.start_date > self.target_date:
            raise ValidationError({
                'target_date': 'Target date must be after start date.'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def is_completed(self):
        """Check if goal's target date has passed"""
        if self.target_date:
            return timezone.now().date() > self.target_date
        return False
    
    @property
    def days_active(self):
        """Calculate number of days since goal started"""
        return (timezone.now().date() - self.start_date).days


class CheckIn(models.Model):
    """
    Model representing a daily check-in for a goal
    """
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILURE', 'Failure'),
        ('SKIPPED', 'Skipped'),
    ]
    
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='checkins'
    )
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='SUCCESS'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['goal', 'date']
        indexes = [
            models.Index(fields=['goal', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.goal.title} - {self.date} ({self.status})"
    
    def clean(self):
        """
        Validate that check-in date is within goal's date range
        """
        if self.date < self.goal.start_date:
            raise ValidationError({
                'date': 'Check-in date cannot be before goal start date.'
            })
        
        if self.goal.target_date and self.date > self.goal.target_date:
            raise ValidationError({
                'date': 'Check-in date cannot be after goal target date.'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
