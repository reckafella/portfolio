# blog/middleware.py
from django.core.cache import cache
from django.http import JsonResponse
import time

from app.views.helpers.helpers import is_ajax


class ViewCountSecurityMiddleware:
    """
    Additional security middleware for view count endpoints
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if this is a view count increment request
        if request.path.startswith('/blog/increment-view/'):
            if not self._is_valid_view_request(request):
                return JsonResponse({'error': 'Invalid request'}, status=403)

        response = self.get_response(request)
        return response

    def _is_valid_view_request(self, request):
        """Additional validation for view count requests"""

        # 1. Must be POST request
        if request.method != 'POST':
            return False

        # 2. Must have proper headers
        if not is_ajax(request):
            return False

        # 3. Global rate limiting per IP
        client_ip = self._get_client_ip(request)
        if not self._check_global_rate_limit(client_ip):
            return False

        # 4. Check for suspicious patterns
        if self._is_suspicious_request(request):
            return False

        return True

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def _check_global_rate_limit(self, client_ip):
        """Global rate limiting: max 10 requests per hour per IP"""
        cache_key = f'global_view_count_rate_limit_{client_ip}'

        ct = time.time()  # current time in seconds
        requests = cache.get(cache_key, [])

        # Remove requests older than 1 hour
        # rt = request time
        requests = [rt for rt in requests if (ct - rt) < 3600]

        if len(requests) >= 10:  # Max 10 requests per hour
            return False

        requests.append(ct)
        cache.set(cache_key, requests, 3600)
        return True

    def _is_suspicious_request(self, request):
        """Check for suspicious patterns"""
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Allow list for legitimate search engines
        legitimate_bots = [
            'googlebot', 'bingbot', 'yahoo', 'duckduckbot', 'baiduspider',
            'yandexbot', 'slurp', 'applebot', 'facebookexternalhit'
        ]

        # Check if it's a legitimate search engine
        if any(bot in user_agent.lower() for bot in legitimate_bots):
            return False

        # Check for suspicious bot patterns
        bot_patterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
        if any(pattern in user_agent.lower() for pattern in bot_patterns):
            return True

        # Check for missing or suspicious user agent
        if not user_agent or len(user_agent) < 10:
            return True

        return False
