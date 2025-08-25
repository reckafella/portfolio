"""
Custom authentication classes for the portfolio API
"""
from rest_framework.authentication import TokenAuthentication
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication that doesn't enforce CSRF for API endpoints
    """
    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


class APITokenAuthentication(TokenAuthentication):
    """
    Token authentication for API endpoints
    """
    pass
