"""
Serializers for CheckIn model
"""
from rest_framework import serializers
from django.utils import timezone
from goals.models import CheckIn


class CheckInSerializer(serializers.ModelSerializer):
    """
    Full serializer for CheckIn CRUD operations
    """
    goal_title = serializers.ReadOnlyField(source='goal.title')
    
    class Meta:
        model = CheckIn
        fields = [
            'id',
            'goal',
            'goal_title',
            'date',
            'status',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_date(self, value):
        """
        Validate that check-in date is within goal's date range
        """
        goal = self.initial_data.get('goal') or (
            self.instance.goal if self.instance else None
        )
        
        if goal:
            # Get goal instance if we have an ID
            from goals.models import Goal
            if isinstance(goal, int):
                try:
                    goal = Goal.objects.get(id=goal)
                except Goal.DoesNotExist:
                    raise serializers.ValidationError('Invalid goal.')
            
            if value < goal.start_date:
                raise serializers.ValidationError(
                    'Check-in date cannot be before goal start date.'
                )
            
            if goal.target_date and value > goal.target_date:
                raise serializers.ValidationError(
                    'Check-in date cannot be after goal target date.'
                )
        
        return value
    
    def validate(self, data):
        """
        Validate unique check-in per day for a goal
        """
        goal = data.get('goal') or (self.instance.goal if self.instance else None)
        date = data.get('date')
        
        if goal and date:
            # Check for existing check-in
            queryset = CheckIn.objects.filter(goal=goal, date=date)
            
            # Exclude current instance if updating
            if self.instance:
                queryset = queryset.exclude(id=self.instance.id)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'date': f'A check-in already exists for {date}.'
                })
        
        return data


class CheckInCreateSerializer(serializers.ModelSerializer):
    """
    Optimized serializer for quick check-in creation
    """
    
    class Meta:
        model = CheckIn
        fields = [
            'id',
            'goal',
            'date',
            'status',
            'notes',
        ]
        read_only_fields = ['id']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set default date to today if not provided
        if not self.initial_data.get('date'):
            self.initial_data['date'] = timezone.now().date()
