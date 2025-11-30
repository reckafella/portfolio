"""
Custom permissions for goals API
"""
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a goal to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the goal
        return obj.user == request.user


class IsGoalOwner(permissions.BasePermission):
    """
    Custom permission for check-ins - verify user owns the goal.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check-in object has a goal attribute
        return obj.goal.user == request.user
