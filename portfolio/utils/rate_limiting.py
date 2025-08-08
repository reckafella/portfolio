"""
Unified Rate Limiting Utilities
Provides centralized rate limiting functionality across the application
"""
import time
import hashlib
from typing import Dict, Any, Tuple
from django.core.cache import cache
from django.conf import settings
from django.http import HttpRequest


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded"""
    pass


class RateLimiter:
    """
    Unified rate limiting class that provides various rate limiting strategies
    """

    def __init__(self, limit_type: str = 'GLOBAL'):
        """
        Initialize rate limiter with specific limit type

        Args:
            limit_type: Type of rate limit from settings.RATE_LIMITING
        """
        self.config = settings.RATE_LIMITING.get(
            limit_type, settings.RATE_LIMITING['GLOBAL']
        )
        self.limit_type = limit_type

    def get_client_identifier(self, request: HttpRequest) -> str:
        """
        Get a unique identifier for the client

        Args:
            request: Django HTTP request object

        Returns:
            Unique client identifier string
        """
        # Get client IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')

        # For some rate limiting, include user agent for better uniqueness
        if self.limit_type == 'BLOG_VIEW_COUNT':
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            combined = f"{ip}_{user_agent}"
            identifier = hashlib.sha256(combined.encode()).hexdigest()
            return identifier

        return ip

    def get_cache_key(self, identifier: str, suffix: str = '') -> str:
        """
        Generate cache key for rate limiting

        Args:
            identifier: Client identifier
            suffix: Optional suffix for the key

        Returns:
            Cache key string
        """
        prefix = self.config['CACHE_KEY_PREFIX']
        if suffix:
            return f'{prefix}_{identifier}_{suffix}'
        return f'{prefix}_{identifier}'

    def is_rate_limited(self, request: HttpRequest,
                        suffix: str = '') -> Tuple[bool, Dict[str, Any]]:
        """
        Check if request should be rate limited

        Args:
            request: Django HTTP request object
            suffix: Optional suffix for cache key uniqueness

        Returns:
            Tuple of (is_limited, info_dict)
        """
        identifier = self.get_client_identifier(request)
        cache_key = self.get_cache_key(identifier, suffix)

        current_time = time.time()
        window = self.config['WINDOW']
        max_requests = self.config['REQUESTS']

        # Get existing requests from cache
        requests = cache.get(cache_key, [])

        # Remove requests outside the current window
        requests = [req_time for req_time in requests
                    if (current_time - req_time) < window]

        # Check if limit exceeded
        if len(requests) >= max_requests:
            return True, {
                'requests_made': len(requests),
                'max_requests': max_requests,
                'window': window,
                'reset_time': requests[0] + window if requests
                else current_time
            }

        # Add current request and update cache
        requests.append(current_time)
        cache.set(cache_key, requests, window)

        return False, {
            'requests_made': len(requests),
            'max_requests': max_requests,
            'window': window,
            'remaining': max_requests - len(requests)
        }

    def is_bot_request(self, request: HttpRequest) -> bool:
        """
        Detect if request is from a bot

        Args:
            request: Django HTTP request object

        Returns:
            True if request appears to be from a bot
        """
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        bot_config = settings.RATE_LIMITING['BOT_DETECTION']

        # Check for legitimate search engines (allow these)
        for legitimate_bot in bot_config['LEGITIMATE_BOTS']:
            if legitimate_bot in user_agent:
                return False

        # Check for suspicious bot patterns
        for pattern in bot_config['SUSPICIOUS_PATTERNS']:
            if pattern in user_agent:
                return True

        # Check for missing or very short user agent
        _agent_len = len(user_agent)
        bot_conf_len = bot_config['MIN_USER_AGENT_LENGTH']
        if (not user_agent or _agent_len < bot_conf_len):
            return True

        return False


class SessionBasedRateLimiter:
    """
    Session-based rate limiting for specific actions like view counting
    """

    def __init__(self, session_timeout: int = None):
        """
        Initialize session-based rate limiter

        Args:
            session_timeout: Timeout in seconds for session keys
        """
        self.session_timeout = (session_timeout or
                                settings.VIEW_COUNT_SESSION_TIMEOUT)

    def is_action_allowed(self, request: HttpRequest,
                          action_key: str) -> bool:
        """
        Check if action is allowed based on session tracking

        Args:
            request: Django HTTP request object
            action_key: Unique key for the action

        Returns:
            True if action is allowed
        """
        session_key = f'action_{action_key}'
        last_action_time = request.session.get(session_key)

        if last_action_time:
            current_time = time.time()
            if (current_time - last_action_time) < self.session_timeout:
                return False

        # Mark action as performed
        request.session[session_key] = time.time()
        return True

    def mark_action_performed(self, request: HttpRequest, action_key: str):
        """
        Mark an action as performed in the session

        Args:
            request: Django HTTP request object
            action_key: Unique key for the action
        """
        session_key = f'action_{action_key}'
        request.session[session_key] = time.time()


# Convenience functions for common use cases
def check_global_rate_limit(
        request: HttpRequest) -> Tuple[bool, Dict[str, Any]]:
    """Check global rate limit for a request"""
    limiter = RateLimiter('GLOBAL')
    return limiter.is_rate_limited(request)


def check_blog_view_rate_limit(request: HttpRequest,
                               post_slug: str) -> Tuple[bool, Dict[str, Any]]:
    """Check blog view count rate limit for a specific post"""
    limiter = RateLimiter('BLOG_VIEW_COUNT')
    return limiter.is_rate_limited(request, suffix=post_slug)


def check_auth_rate_limit(request: HttpRequest) -> Tuple[bool, Dict[str, Any]]:
    """Check authentication rate limit for a request"""
    limiter = RateLimiter('AUTH')
    return limiter.is_rate_limited(request)


def is_bot_request(request: HttpRequest) -> bool:
    """Check if request is from a bot"""
    limiter = RateLimiter()
    return limiter.is_bot_request(request)


def can_increment_view_count(request: HttpRequest,
                             post_slug: str) -> bool:
    """
    Check if view count can be incremented for a post
    Combines both rate limiting and session tracking
    """
    # Check bot detection first
    if is_bot_request(request):
        return False

    # Check rate limiting
    is_limited, _ = check_blog_view_rate_limit(request, post_slug)
    if is_limited:
        return False

    # Check session-based cooldown
    session_limiter = SessionBasedRateLimiter()
    action_key = f'view_post_{post_slug}'

    return session_limiter.is_action_allowed(request, action_key)
