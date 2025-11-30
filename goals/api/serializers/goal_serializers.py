"""
Serializers for Goal model
"""
from rest_framework import serializers
from goals.models import Goal
from goals.utils.streak_calculator import get_streak_info
from goals.utils.statistics import (
    calculate_success_rate,
    get_weekly_summary,
    get_monthly_summary
)


class GoalSerializer(serializers.ModelSerializer):
    """
    Full serializer for Goal CRUD operations
    """
    user = serializers.ReadOnlyField(source='user.username')
    current_streak = serializers.SerializerMethodField()
    longest_streak = serializers.SerializerMethodField()
    checkin_count = serializers.SerializerMethodField()
    success_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id',
            'user',
            'title',
            'description',
            'goal_type',
            'category',
            'target_frequency',
            'start_date',
            'target_date',
            'is_active',
            'is_private',
            'current_streak',
            'longest_streak',
            'checkin_count',
            'success_rate',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_current_streak(self, obj):
        """Get current streak for the goal"""
        streak_info = get_streak_info(obj)
        return streak_info['current_streak']
    
    def get_longest_streak(self, obj):
        """Get longest streak for the goal"""
        streak_info = get_streak_info(obj)
        return streak_info['longest_streak']
    
    def get_checkin_count(self, obj):
        """Get total check-in count"""
        return obj.checkins.count()
    
    def get_success_rate(self, obj):
        """Get overall success rate"""
        return calculate_success_rate(obj, period='all')
    
    def validate_title(self, value):
        """
        Validate that title is unique for this user
        """
        user = self.context['request'].user
        title = value.strip()
        
        # Check if updating existing goal
        instance = self.instance
        queryset = Goal.objects.filter(user=user, title__iexact=title)
        
        if instance:
            # Exclude current instance when updating
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                'You already have a goal with this title. Please choose a different title.'
            )
        
        return title
    
    def validate(self, data):
        """
        Validate that start_date is before target_date
        """
        start_date = data.get('start_date')
        target_date = data.get('target_date')
        
        if target_date and start_date and start_date > target_date:
            raise serializers.ValidationError({
                'target_date': 'Target date must be after start date.'
            })
        
        return data


class GoalListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for goal list views
    """
    current_streak = serializers.SerializerMethodField()
    checkin_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id',
            'title',
            'goal_type',
            'category',
            'target_frequency',
            'start_date',
            'target_date',
            'is_active',
            'current_streak',
            'checkin_count',
        ]
    
    def get_current_streak(self, obj):
        """Get current streak for the goal"""
        streak_info = get_streak_info(obj)
        return streak_info['current_streak']
    
    def get_checkin_count(self, obj):
        """Get total check-in count"""
        return obj.checkins.count()


class GoalAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for detailed goal analytics
    """
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    success_rate_overall = serializers.FloatField()
    success_rate_week = serializers.FloatField()
    success_rate_month = serializers.FloatField()
    total_checkins = serializers.IntegerField()
    weekly_summary = serializers.DictField()
    monthly_summary = serializers.DictField()
    
    def to_representation(self, goal):
        """
        Convert goal instance to analytics data
        """
        streak_info = get_streak_info(goal)
        
        return {
            'current_streak': streak_info['current_streak'],
            'longest_streak': streak_info['longest_streak'],
            'success_rate_overall': calculate_success_rate(goal, period='all'),
            'success_rate_week': calculate_success_rate(goal, period='week'),
            'success_rate_month': calculate_success_rate(goal, period='month'),
            'total_checkins': goal.checkins.count(),
            'weekly_summary': get_weekly_summary(goal),
            'monthly_summary': get_monthly_summary(goal),
        }
