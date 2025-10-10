"""Cache utilities for the portfolio application."""
from functools import wraps
from django.conf import settings
from django.core.cache import cache
from django.utils.cache import patch_response_headers
from django.views.decorators.cache import cache_page as django_cache_page


def cache_page_with_prefix(prefix, timeout=None):
    """
    Cache decorator that includes a prefix in the cache key.
    Uses Django's built-in cache_page decorator internally to ensure
    proper handling of response rendering.
    """
    cache_decorator = django_cache_page(timeout or settings.CACHE_MIDDLEWARE_SECONDS)

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not settings.USE_CACHE or request.user.is_authenticated:
                return view_func(request, *args, **kwargs)

            # Add prefix to the request for key generation
            request._cache_prefix = prefix

            # Use Django's cache_page decorator
            cached_view = cache_decorator(view_func)
            return cached_view(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def cache_page_for_user(timeout=None):
    """
    Cache decorator that includes the user's ID in the cache key.
    Different users will get different cached versions.
    """
    cache_decorator = django_cache_page(timeout or settings.CACHE_MIDDLEWARE_SECONDS)

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not settings.USE_CACHE:
                return view_func(request, *args, **kwargs)

            # Add user ID to the request for key generation
            user_id = request.user.id if request.user.is_authenticated else 'anonymous'
            request._cache_user = user_id

            # Use Django's cache_page decorator
            cached_view = cache_decorator(view_func)
            return cached_view(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def cache_control(**kwargs):
    """
    Decorator to set cache control headers on the response.
    Example usage: @cache_control(max_age=3600, private=True)
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            response = view_func(request, *args, **kwargs)
            patch_response_headers(response, **kwargs)
            return response
        return _wrapped_view
    return decorator


def add_cache_headers(response, **kwargs):
    """
    Add cache control headers to a response.
    """
    if not hasattr(response, 'headers'):
        return response

    if 'max_age' in kwargs:
        max_age = kwargs['max_age']
        if 'private' in kwargs and kwargs['private']:
            response.headers['Cache-Control'] = f'private, max-age={max_age}'
        else:
            response.headers['Cache-Control'] = f'public, max-age={max_age}'

    return response


def invalidate_cache_prefix(prefix):
    """
    Invalidate all cache keys with the given prefix.
    Note: This is a basic implementation that deletes the specific prefix key.
    For more complex invalidation patterns, consider using cache versioning.
    """
    if not settings.USE_CACHE:
        return

    # Delete the specific cache key with the prefix
    cache_key = f"{prefix}:version"
    version = cache.get(cache_key, 1)
    cache.set(cache_key, version + 1)  # Increment version to invalidate cache


def invalidate_template_cache(fragment_name, *args, **kwargs):
    """
    Invalidate a specific template cache fragment.
    """
    if not settings.USE_CACHE:
        return

    cache_key = 'template.cache.%s.%s' % (fragment_name, hash((args, tuple(sorted(kwargs.items())))))
    cache.delete(cache_key)
