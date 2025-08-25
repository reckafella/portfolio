from rest_framework import permissions
from django.contrib.auth.models import User


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow staff users to create/edit projects.
    Regular users can only view projects.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed for staff users.
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsOwnerOrStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to edit it.
    Regular users can only view.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions require authentication
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner or staff
        # Note: Projects don't have an owner field by default, so we check for staff
        return request.user.is_staff


class IsAuthenticatedStaff(permissions.BasePermission):
    """
    Permission to only allow authenticated staff users.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff
