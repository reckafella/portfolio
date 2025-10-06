"""Cache utilities for the portfolio application."""
from functools import wraps
from django.conf import settings
from django.core.cache import cache
from django.utils.cache import get_cache_key, learn_cache_key
from django.utils.decorators import method_decorator


def cache_page_with_prefix(prefix, timeout=None):
    """
    Cache decorator that includes a prefix in the cache key.
    Useful for versioning or namespacing cache keys.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not settings.USE_CACHE:
                return view_func(request, *args, **kwargs)

            # Generate cache key using the prefix and full URL
            cache_timeout = timeout or settings.CACHE_MIDDLEWARE_SECONDS
            cache_key = f"{prefix}:{request.build_absolute_uri()}"

            # Try to get the response from cache
            response = cache.get(cache_key)
            if response is None:
                # Generate the response if not cached
                response = view_func(request, *args, **kwargs)
                # Cache the response
                cache.set(cache_key, response, cache_timeout)

            return response
        return _wrapped_view
    return decorator


def cache_page_for_user(timeout=None):
    """
    Cache decorator that includes the user's ID in the cache key.
    Different users will get different cached versions.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not settings.USE_CACHE:
                return view_func(request, *args, **kwargs)

            # Include user ID in cache key
            user_id = request.user.id if request.user.is_authenticated else 'anonymous'
            cache_timeout = timeout or settings.CACHE_MIDDLEWARE_SECONDS
            cache_key = f"user:{user_id}:{request.build_absolute_uri()}"

            # Try to get the response from cache
            response = cache.get(cache_key)
            if response is None:
                response = view_func(request, *args, **kwargs)
                cache.set(cache_key, response, cache_timeout)

            return response
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


def patch_response_headers(response, **kwargs):
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
    """
    if not settings.USE_CACHE:
        return

    # Get all keys matching the prefix
    pattern = f"{prefix}:*"
    keys = cache.keys(pattern)
    if keys:
        cache.delete_many(keys)


def invalidate_template_cache(fragment_name, *args, **kwargs):
    """
    Invalidate a specific template cache fragment.
    """
    if not settings.USE_CACHE:
        return

    cache_key = 'template.cache.%s.%s' % (fragment_name, hash((args, tuple(sorted(kwargs.items())))))
    cache.delete(cache_key)
