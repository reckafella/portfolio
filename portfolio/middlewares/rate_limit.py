"""
Improved Rate Limiting Middleware
Uses the unified rate limiting system
"""
from django.http import JsonResponse

from portfolio.utils.rate_limiting import RateLimiter, RateLimitExceeded


class RateLimitMiddleware:
    """
    Global rate limiting middleware using unified rate limiting system
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limiter = RateLimiter('GLOBAL')

    def __call__(self, request):
        # Check rate limit
        is_limited, info = self.rate_limiter.is_rate_limited(request)

        if is_limited:
            # Return appropriate error response
            if request.path.startswith('/api/'):
                # API endpoints get JSON response
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'detail': f'Too many requests. Try again in\
                     {info["reset_time"] - info.get("current_time", 0):.0f}\
                     seconds.',
                    'requests_made': info['requests_made'],
                    'max_requests': info['max_requests'],
                    'window': info['window']
                }, status=429)
            else:
                # Web pages get error handler
                from authentication.views.auth.errors import handler_429 as _429
                return _429(request, RateLimitExceeded("Rate Limit Exceeded"))

        response = self.get_response(request)

        # Add rate limit headers for API responses
        if request.path.startswith('/api/'):
            response['X-RateLimit-Limit'] = str(info.get('max_requests', 0))
            response['X-RateLimit-Remaining'] = str(info.get('remaining', 0))
            response['X-RateLimit-Window'] = str(info.get('window', 0))

        return response
