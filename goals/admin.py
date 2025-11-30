"""
Admin configuration for goals app
"""
from django.contrib import admin
from goals.models import Goal, CheckIn


class CheckInInline(admin.TabularInline):
    """
    Inline admin for check-ins on goal detail page
    """
    model = CheckIn
    extra = 0
    fields = ('date', 'status', 'notes')
    ordering = ['-date']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    """
    Admin interface for Goal model
    """
    list_display = (
        'title',
        'user',
        'goal_type',
        'category',
        'start_date',
        'target_date',
        'is_active',
        'created_at'
    )
    list_filter = (
        'goal_type',
        'category',
        'is_active',
        'target_frequency',
        'created_at'
    )
    search_fields = ('title', 'description', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'start_date'
    inlines = [CheckInInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description')
        }),
        ('Goal Configuration', {
            'fields': (
                'goal_type',
                'category',
                'target_frequency',
                'start_date',
                'target_date'
            )
        }),
        ('Settings', {
            'fields': ('is_active', 'is_private')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    """
    Admin interface for CheckIn model
    """
    list_display = (
        'goal',
        'date',
        'status',
        'created_at'
    )
    list_filter = (
        'status',
        'date',
        'created_at'
    )
    search_fields = ('goal__title', 'notes')
    readonly_fields = ('created_at',)
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Check-in Information', {
            'fields': ('goal', 'date', 'status', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
