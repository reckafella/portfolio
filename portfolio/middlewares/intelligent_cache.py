"""
Intelligent Cache Middleware - A Masterpiece Solution
====================================================

This middleware provides intelligent caching that:
1. Automatically detects and excludes forms, captcha, and dynamic content
2. Uses multiple detection methods for comprehensive coverage
3. Provides fine-grained cache control
4. Optimizes performance while maintaining security
"""

import re
import hashlib
from typing import Set, List, Optional, Dict, Any
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.middleware.cache import UpdateCacheMiddleware, FetchFromCacheMiddleware
from django.utils.cache import get_cache_key, learn_cache_key
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured


class IntelligentCacheMiddleware:
    """
    Masterpiece intelligent cache middleware that automatically detects
    and excludes forms, captcha, and dynamic content from caching.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self._excluded_patterns = None
        self._excluded_headers = None
        self._excluded_content_types = None
        self._dynamic_indicators = None
        self._setup_exclusion_patterns()

    def _setup_exclusion_patterns(self):
        """Setup comprehensive exclusion patterns and indicators."""

        # URL patterns that should NEVER be cached
        self._excluded_patterns = [
            # Authentication endpoints
            r'^/login/?$',
            r'^/signup/?$',
            r'^/register/?$',
            r'^/logout/?$',
            r'^/password-reset/?$',
            r'^/password-reset/confirm/?$',
            r'^/auth/',

            # Form endpoints
            r'^/contact/?$',
            r'^/contact/submit/?$',
            r'^/message/?$',
            r'^/inbox/?$',
            r'^/inbox/.+/?$',

            # Captcha endpoints
            r'^/captcha/',
            r'^/refresh-captcha/?$',
            r'^/api/captcha/',

            # Admin and management
            r'^/admin/',
            r'^/wagtail/',
            r'^/api/admin/',

            # Dynamic content creation/editing
            r'^/blog/article/new/?$',
            r'^/blog/article/.+/edit/?$',
            r'^/blog/article/.+/update/?$',
            r'^/blog/article/.+/delete/?$',
            r'^/projects/new/?$',
            r'^/projects/.+/edit/?$',
            r'^/projects/.+/update/?$',
            r'^/projects/.+/delete/?$',
            r'^/about/edit/?$',
            r'^/profile/edit/?$',

            # API endpoints with forms or dynamic content
            r'^/api/v1/auth/',
            r'^/api/v1/login/',
            r'^/api/v1/register/',
            r'^/api/v1/contact/',
            r'^/api/v1/messages/',
            r'^/api/v1/captcha/',
            r'^/api/v1/blog/article/(create|new)/?$',
            r'^/api/v1/blog/article/.+/(update|delete)/?$',
            r'^/api/v1/projects/(create|new)/?$',
            r'^/api/v1/projects/.+/(update|delete)/?$',

            # Session management
            r'^/session/?$',
            r'^/api/session/',

            # Search with dynamic results
            r'^/search/?$',
            r'^/api/search/',

            # Comments and interactions
            r'^/comments/',
            r'^/api/comments/',
            r'^/blog/.+/comment/?$',

            # User-specific content
            r'^/dashboard/?$',
            r'^/profile/?$',
            r'^/account/?$',

            # File uploads
            r'^/upload/',
            r'^/api/upload/',
            r'^/media/upload/',

            # CSRF and security
            r'^/csrf/',
            r'^/api/csrf/',
        ]

        # HTTP headers that indicate dynamic content
        self._excluded_headers = {
            'X-CSRFToken',
            'X-CSRF-Token',
            'Authorization',
            'Cookie',
            'Set-Cookie',
            'X-Requested-With',
            'X-Captcha-Key',
            'X-Form-Token',
        }

        # Content types that indicate forms or dynamic content
        self._excluded_content_types = {
            'application/json',
            'application/x-www-form-urlencoded',
            'multipart/form-data',
            'application/xml',
            'text/xml',
        }

        # Content indicators that suggest dynamic/form content
        self._dynamic_indicators = {
            # Form-related HTML elements
            '<form',
            '<input',
            '<textarea',
            '<select',
            '<button',
            'name="csrfmiddlewaretoken"',
            'name="captcha"',
            'id="captcha"',
            'class="captcha"',
            'data-captcha',

            # JavaScript form handling
            'document.forms',
            'form.submit',
            'addEventListener.*submit',
            'onSubmit',
            'onclick.*submit',

            # Django form indicators
            '{% csrf_token %}',
            '{% load crispy_forms_tags %}',
            'form.as_p',
            'form.as_table',
            'form.as_ul',
            'form.errors',
            'form.non_field_errors',

            # Captcha specific indicators
            'captcha',
            'recaptcha',
            'hcaptcha',
            'turnstile',

            # Dynamic content indicators
            'csrfmiddlewaretoken',
            'sessionid',
            'messages',
            'error_message',
            'success_message',
            'form_errors',
            'validation_error',
        }

    def should_exclude_from_cache(self, request: HttpRequest, response: Optional[HttpResponse] = None) -> bool:
        """
        Comprehensive method to determine if request/response should be excluded from cache.

        Args:
            request: The HTTP request
            response: The HTTP response (optional, for response-time checks)

        Returns:
            True if should be excluded from cache, False otherwise
        """

        # 1. Check URL patterns
        if self._check_url_patterns(request):
            return True

        # 2. Check HTTP method (POST, PUT, DELETE should never be cached)
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            return True

        # 3. Check authentication status
        if self._check_authentication(request):
            return True

        # 4. Check headers
        if self._check_headers(request, response):
            return True

        # 5. Check query parameters
        if self._check_query_parameters(request):
            return True

        # 6. Check response content (if available)
        if response and self._check_response_content(response):
            return True

        # 7. Check for form-related cookies
        if self._check_form_cookies(request):
            return True

        return False

    def _check_url_patterns(self, request: HttpRequest) -> bool:
        """Check if URL matches exclusion patterns."""
        path = request.path_info

        for pattern in self._excluded_patterns:
            if re.match(pattern, path, re.IGNORECASE):
                return True

        return False

    def _check_authentication(self, request: HttpRequest) -> bool:
        """Check if user is authenticated (exclude from cache)."""
        # Don't cache authenticated users
        if hasattr(request, 'user') and hasattr(request.user, 'is_authenticated') and request.user.is_authenticated:
            return True

        # Check for authentication tokens
        auth_headers = ['Authorization', 'X-Auth-Token', 'X-API-Key']
        for header in auth_headers:
            if request.META.get(f'HTTP_{header.upper().replace("-", "_")}'):
                return True

        return False

    def _check_headers(self, request: HttpRequest, response: Optional[HttpResponse] = None) -> bool:
        """Check headers for dynamic content indicators."""

        # Check request headers
        for header_name in self._excluded_headers:
            if request.META.get(f'HTTP_{header_name.upper().replace("-", "_")}'):
                return True

        # Check response headers
        if response is not None:
            for header_name in self._excluded_headers:
                if response.get(header_name):
                    return True

            # Check content type
            content_type = response.get('Content-Type', '')
            if content_type:
                content_type = content_type.lower()
                for excluded_type in self._excluded_content_types:
                    if excluded_type in content_type:
                        return True

        return False

    def _check_query_parameters(self, request: HttpRequest) -> bool:
        """Check query parameters for dynamic content indicators."""
        query_params = request.GET

        # Parameters that indicate dynamic content
        dynamic_params = {
            'csrf', 'captcha', 'token', 'form', 'submit', 'action',
            'edit', 'delete', 'update', 'create', 'new', 'search',
            'filter', 'sort', 'page', 'ajax', 'callback'
        }

        for param in query_params:
            if param.lower() in dynamic_params:
                return True

        return False

    def _check_response_content(self, response: HttpResponse) -> bool:
        """Check response content for dynamic indicators."""
        if not hasattr(response, 'content'):
            return False

        content = response.content.decode('utf-8', errors='ignore').lower()

        # Check for dynamic content indicators
        for indicator in self._dynamic_indicators:
            if indicator.lower() in content:
                return True

        # Check for form elements
        form_elements = ['<form', '<input', '<textarea', '<select', '<button']
        for element in form_elements:
            if element in content:
                return True

        return False

    def _check_form_cookies(self, request: HttpRequest) -> bool:
        """Check for form-related cookies."""
        form_cookies = {
            'csrftoken', 'csrfmiddlewaretoken', 'sessionid',
            'captcha', 'form_token', 'validation_token'
        }

        for cookie_name in request.COOKIES:
            if cookie_name.lower() in form_cookies:
                return True

        return False

    def __call__(self, request: HttpRequest) -> HttpResponse:
        """Main middleware entry point."""

        # Check if we should exclude from cache
        if self.should_exclude_from_cache(request):
            # Mark request to skip caching
            setattr(request, '_skip_cache', True)
            setattr(request, '_cache_update_cache', False)

        response = self.get_response(request)

        # Double-check response for exclusion
        if hasattr(request, '_skip_cache') and request._skip_cache:
            # Add headers to prevent caching
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            response['X-Cache-Status'] = 'SKIPPED'
        else:
            response['X-Cache-Status'] = 'ELIGIBLE'

        return response


class IntelligentUpdateCacheMiddleware(UpdateCacheMiddleware):
    """Enhanced update cache middleware with intelligent exclusions."""

    def __init__(self, get_response):
        super().__init__(get_response)
        self.intelligent_cache = IntelligentCacheMiddleware(get_response)

    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """Process response with intelligent cache exclusion."""

        # Use intelligent cache logic
        if self.intelligent_cache.should_exclude_from_cache(request, response):
            # Add no-cache headers
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            response['X-Cache-Status'] = 'EXCLUDED'
            return response

        # Proceed with normal caching
        return super().process_response(request, response)


class IntelligentFetchFromCacheMiddleware(FetchFromCacheMiddleware):
    """Enhanced fetch from cache middleware with intelligent exclusions."""

    def __init__(self, get_response):
        super().__init__(get_response)
        self.intelligent_cache = IntelligentCacheMiddleware(get_response)

    def process_request(self, request: HttpRequest) -> Optional[HttpResponse]:
        """Process request with intelligent cache exclusion."""

        # Use intelligent cache logic
        if self.intelligent_cache.should_exclude_from_cache(request):
            # Mark to skip caching
            setattr(request, '_cache_update_cache', False)
            setattr(request, '_skip_cache', True)
            return None

        # Proceed with normal cache fetching
        return super().process_request(request)


# Cache control decorators for fine-grained control
def never_cache(view_func):
    """Decorator to never cache a view."""
    def wrapper(request, *args, **kwargs):
        request._never_cache = True
        response = view_func(request, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    return wrapper


def cache_control(max_age=None, s_maxage=None, public=False, private=False, no_cache=False, no_store=False):
    """Decorator for fine-grained cache control."""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            response = view_func(request, *args, **kwargs)

            cache_headers = []

            if max_age is not None:
                cache_headers.append(f'max-age={max_age}')

            if s_maxage is not None:
                cache_headers.append(f's-maxage={s_maxage}')

            if public:
                cache_headers.append('public')

            if private:
                cache_headers.append('private')

            if no_cache:
                cache_headers.append('no-cache')

            if no_store:
                cache_headers.append('no-store')

            if cache_headers:
                response['Cache-Control'] = ', '.join(cache_headers)

            return response
        return wrapper
    return decorator


def cache_by_user(view_func):
    """Decorator to cache per user."""
    def wrapper(request, *args, **kwargs):
        # Add user-specific cache key
        if hasattr(request, 'user') and request.user.is_authenticated:
            request._cache_key_user = str(request.user.id)

        response = view_func(request, *args, **kwargs)

        # Add user-specific cache headers
        if hasattr(request, '_cache_key_user'):
            response['X-Cache-User'] = request._cache_key_user

        return response
    return wrapper


def cache_by_session(view_func):
    """Decorator to cache per session."""
    def wrapper(request, *args, **kwargs):
        # Add session-specific cache key
        if hasattr(request, 'session') and request.session.session_key:
            request._cache_key_session = request.session.session_key

        response = view_func(request, *args, **kwargs)

        # Add session-specific cache headers
        if hasattr(request, '_cache_key_session'):
            response['X-Cache-Session'] = request._cache_key_session

        return response
    return wrapper
