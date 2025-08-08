"""
Blog View Count Security Middleware
Enhanced security using unified rate limiting system
"""
from django.http import JsonResponse

from app.views.helpers.helpers import is_ajax
from portfolio.utils.rate_limiting import RateLimiter, is_bot_request


class ViewCountSecurityMiddleware:
    """
    Enhanced security middleware for view count endpoints using unified system
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limiter = RateLimiter('BLOG_VIEW_COUNT')

    def __call__(self, request):
        # Check if this is a view count increment request
        if request.path.startswith('/blog/increment-view/'):
            if not self._is_valid_view_request(request):
                return JsonResponse({'error': 'Invalid request'}, status=403)

        response = self.get_response(request)
        return response

    def _is_valid_view_request(self, request):
        """Enhanced validation for view count requests using unified system"""

        # 1. Must be POST request
        if request.method != 'POST':
            return False

        # 2. Must have proper headers
        if not is_ajax(request):
            return False

        # 3. Check for bot requests
        if is_bot_request(request):
            return False

        # 4. Check rate limiting (this will be done per post in the view)
        # We do a general check here for overall view count rate limiting
        is_limited, _ = self.rate_limiter.is_rate_limited(request)
        if is_limited:
            return False

        return True
