from django.contrib import admin
from django.db import models
from django.forms import JSONField, Textarea
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from app.forms.contact import ContactFormAdminForm
from app.forms.projects import ProjectsAdmin
from app.models import Message, Projects, Profile, Education, Experience, Skill

# Enhanced admin site configuration
admin.site.site_header = 'Portfolio Administration'
admin.site.site_title = 'Portfolio Admin'
admin.site.index_title = 'Welcome to Portfolio Administration'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Premium admin interface for Profile management"""

    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'title', 'location', 'email', 'phone'),
            'classes': ('wide',),
        }),
        ('Professional Summary', {
            'fields': ('summary',),
            'classes': ('wide',),
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')
    list_display = ('name', 'title', 'location', 'email', 'updated_at')
    search_fields = ('name', 'title', 'email')

    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 4, 'cols': 80})},
    }

    def has_add_permission(self, request):
        # Only allow one profile instance
        if Profile.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of the profile
        return False

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    """Premium admin interface for Education management"""

    fieldsets = (
        ('Education Details', {
            'fields': ('degree', 'institution', 'period'),
            'classes': ('wide',),
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('wide',),
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active'),
            'classes': ('collapse',),
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    list_display = ('degree', 'institution', 'period', 'is_active_badge', 'order', 'is_active', 'updated_at')
    list_filter = ('is_active', 'institution')
    search_fields = ('degree', 'institution', 'description')
    list_editable = ('order', 'is_active')
    ordering = ('order', '-created_at')
    readonly_fields = ('created_at', 'updated_at')

    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 4, 'cols': 80})},
    }

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✓ Active</span>'
            )
        else:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">✗ Inactive</span>'
            )
    is_active_badge.short_description = 'Status'

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    """Premium admin interface for Experience management"""

    fieldsets = (
        ('Position Details', {
            'fields': ('title', 'company', 'period', 'icon_type'),
            'classes': ('wide',),
        }),
        ('Responsibilities', {
            'fields': ('responsibilities',),
            'classes': ('wide',),
            'description': 'Enter responsibilities as a JSON array, e.g., ["Task 1", "Task 2", "Task 3"]'
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active'),
            'classes': ('collapse',),
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    list_display = ('title', 'company', 'period', 'icon_display', 'is_active_badge', 'order', 'is_active', 'updated_at')
    list_filter = ('is_active', 'icon_type', 'company')
    search_fields = ('title', 'company', 'responsibilities')
    list_editable = ('order', 'is_active')
    ordering = ('order', '-created_at')
    readonly_fields = ('created_at', 'updated_at')

    formfield_overrides = {
        models.JSONField: {'widget': Textarea(attrs={'rows': 6, 'cols': 80})},
    }

    def icon_display(self, obj):
        icon_map = {
            'building': '🏢',
            'laptop': '💻',
            'graph-up': '📈',
            'code-slash': '💻',
            'globe': '🌐',
        }
        icon = icon_map.get(obj.icon_type, '🏢')
        return format_html(f'{icon} {obj.get_icon_type_display()}')
    icon_display.short_description = 'Icon'

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✓ Active</span>'
            )
        else:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">✗ Inactive</span>'
            )
    is_active_badge.short_description = 'Status'

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Premium admin interface for Skills management"""

    fieldsets = (
        ('Skill Information', {
            'fields': ('name', 'category', 'proficiency_level'),
            'classes': ('wide',),
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active'),
            'classes': ('collapse',),
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    list_display = ('name', 'category', 'proficiency_badge', 'is_active_badge', 'order', 'is_active', 'updated_at')
    list_filter = ('is_active', 'proficiency_level', 'category')
    search_fields = ('name', 'category')
    list_editable = ('order', 'is_active', 'category')
    ordering = ('order', 'name')
    readonly_fields = ('created_at', 'updated_at')

    def proficiency_badge(self, obj):
        colors = {
            1: '#17a2b8',  # info
            2: '#ffc107',  # warning
            3: '#28a745',  # success
            4: '#6f42c1',  # purple
        }
        color = colors.get(obj.proficiency_level, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color, obj.get_proficiency_level_display()
        )
    proficiency_badge.short_description = 'Proficiency'

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✓ Active</span>'
            )
        else:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">✗ Inactive</span>'
            )
    is_active_badge.short_description = 'Status'

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


admin.site.register(Projects, ProjectsAdmin)
admin.site.register(Message, ContactFormAdminForm)
