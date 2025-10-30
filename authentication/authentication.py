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
    Token authentication for API endpoints that reads token from httpOnly cookie
    Falls back to Authorization header if cookie is not present
    """
    def authenticate(self, request):
        # First, try to get token from httpOnly cookie
        token_from_cookie = request.COOKIES.get('auth_token')
        
        if token_from_cookie:
            # Use the cookie token
            return self.authenticate_credentials(token_from_cookie)
        
        # Fall back to standard Authorization header authentication
        return super().authenticate(request)
