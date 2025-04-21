from django.core.cache import cache
import time
from django.conf import settings


class RateLimitExceeded(Exception):
    pass


class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR')
        key = f'ratelimit:{ip}'

        # get request count & last reset time
        data = cache.get(key, {'count': 0, 'reset': time.time()})

        # reset if an hour has passed since last reset time
        if (time.time() - data['reset'] > 3600):
            data = {'count': 0, 'reset': time.time()}

        # check limit (set in settings.py, DEFAULT to 100)
        rate_limit = settings.RATELIMIT if settings.RATELIMIT >= 100 else 100
        if (data['count'] >= rate_limit):
            from app.views.errors import handler_429 as _429
            return _429(request, RateLimitExceeded("Rate Limit Exceeded"))

        data['count'] += 1
        cache.set(key, data, timeout=3600)

        response = self.get_response(request)
        return response
