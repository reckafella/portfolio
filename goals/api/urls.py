"""
URL configuration for goals API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from goals.api.views.goal_views import GoalViewSet
from goals.api.views.checkin_views import CheckInViewSet
from goals.api.views.utils import reminders_view

app_name = 'goals_api'

# Setup router for ViewSets
router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'checkins', CheckInViewSet, basename='checkin')

urlpatterns = [
    # Utility endpoints
    path('reminders/', reminders_view, name='reminders'),

    # Nested check-ins endpoint
    path(
        'goals/<int:goal_id>/checkins/',
        CheckInViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='goal-checkins'
    ),

    # Include router URLs
    path('', include(router.urls)),
]
