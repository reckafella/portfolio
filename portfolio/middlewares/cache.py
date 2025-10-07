"""Custom cache middleware to exclude specific URLs."""
import re
from django.conf import settings
from django.middleware.cache import UpdateCacheMiddleware, FetchFromCacheMiddleware


class CustomUpdateCacheMiddleware(UpdateCacheMiddleware):
    """Custom update cache middleware that excludes specific URLs."""

    def process_response(self, request, response):
        # List of URL patterns to exclude from caching
        EXCLUDE_PATTERNS = [
            # Auth URLs
            r'^/login?$',
            r'^/signup?$',
            r'^/logout?$',
            # Form URLs
            r'^/contact?$',
            # Blog management URLs
            r'^/blog/article/new?$',
            r'^/blog/article/.+/update?$',
            r'^/blog/article/.+/delete?$',
            # Project management URLs
            r'^/projects/new?$',
            r'^/projects/.+/update?$',
            r'^/projects/.+/delete?$',
            # Profile/About management
            r'^/about/edit/?$',
            # API endpoints that shouldn't be cached
            r'^/api/v1/auth/?$',
            r'^/api/v1/blog/article/(create|new)?$',
            r'^/api/v1/blog/article/.+/(update|delete)',
            r'^/api/v1/projects/(create|new)?$',
            r'^/api/v1/projects/.+/(update|delete)',
        ]

        # Check if the current URL matches any exclude pattern
        path = request.path_info.lstrip('/')
        for pattern in EXCLUDE_PATTERNS:
            if re.match(pattern, path):
                return response

        # If URL should be cached, proceed with normal caching
        return super().process_response(request, response)


class CustomFetchFromCacheMiddleware(FetchFromCacheMiddleware):
    """Custom fetch from cache middleware that excludes specific URLs."""

    def process_request(self, request):
        # List of URL patterns to exclude from caching
        EXCLUDE_PATTERNS = [
            # Auth URLs
            r'^/login?$',
            r'^/signup?$',
            r'^/logout?$',
            # Form URLs
            r'^/contact?$',
            # Blog management URLs
            r'^/blog/article/new?$',
            r'^/blog/article/.+/update?$',
            r'^/blog/article/.+/delete?$',
            # Project management URLs
            r'^/projects/new?$',
            r'^/projects/.+/update?$',
            r'^/projects/.+/delete?$',
            # Profile/About management
            r'^/about/edit/?$',
            # API endpoints that shouldn't be cached
            r'^/api/v1/auth/?$',
            r'^/api/v1/blog/article/(create|new)?$',
            r'^/api/v1/blog/article/.+/(update|delete)',
            r'^/api/v1/projects/(create|new)?$',
            r'^/api/v1/projects/.+/(update|delete)',
        ]

        # Check if the current URL matches any exclude pattern
        path = request.path_info.lstrip('/')
        for pattern in EXCLUDE_PATTERNS:
            if re.match(pattern, path):
                request._cache_update_cache = False
                return None

        # If URL should be cached, proceed with normal caching
        return super().process_request(request)
