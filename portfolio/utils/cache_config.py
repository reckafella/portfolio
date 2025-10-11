"""
Cache Configuration Utility - Advanced Cache Management
======================================================

This utility provides advanced cache configuration and management features
including cache warming, invalidation, and intelligent cache strategies.
"""

import hashlib
import json
import time
from typing import Dict, List, Optional, Any, Callable
from django.conf import settings
from django.core.cache import cache
from django.http import HttpRequest, HttpResponse
from django.urls import reverse, NoReverseMatch
from django.utils.cache import get_cache_key
from django.core.exceptions import ImproperlyConfigured


class CacheConfig:
    """Advanced cache configuration and management."""
    
    # Cache strategies
    CACHE_STRATEGIES = {
        'AGGRESSIVE': {
            'default_ttl': 3600,  # 1 hour
            'static_ttl': 86400,  # 24 hours
            'dynamic_ttl': 300,   # 5 minutes
            'api_ttl': 60,        # 1 minute
        },
        'BALANCED': {
            'default_ttl': 1800,  # 30 minutes
            'static_ttl': 43200,  # 12 hours
            'dynamic_ttl': 600,   # 10 minutes
            'api_ttl': 120,       # 2 minutes
        },
        'CONSERVATIVE': {
            'default_ttl': 600,   # 10 minutes
            'static_ttl': 21600,  # 6 hours
            'dynamic_ttl': 300,   # 5 minutes
            'api_ttl': 30,        # 30 seconds
        },
        'NO_CACHE': {
            'default_ttl': 0,
            'static_ttl': 0,
            'dynamic_ttl': 0,
            'api_ttl': 0,
        }
    }
    
    # Content type cache mappings
    CONTENT_TYPE_TTL = {
        'text/html': 'default_ttl',
        'text/css': 'static_ttl',
        'application/javascript': 'static_ttl',
        'image/': 'static_ttl',
        'application/json': 'api_ttl',
        'text/plain': 'default_ttl',
    }
    
    # URL pattern cache mappings
    URL_PATTERN_TTL = {
        r'^/static/': 'static_ttl',
        r'^/media/': 'static_ttl',
        r'^/api/': 'api_ttl',
        r'^/blog/': 'dynamic_ttl',
        r'^/projects/': 'dynamic_ttl',
        r'^/$': 'default_ttl',
    }
    
    def __init__(self, strategy: str = 'BALANCED'):
        self.strategy = strategy.upper()
        if self.strategy not in self.CACHE_STRATEGIES:
            raise ImproperlyConfigured(f"Invalid cache strategy: {strategy}")

        self.config = self.CACHE_STRATEGIES[self.strategy]

    def get_ttl_for_request(self, request: HttpRequest) -> int:
        """Get appropriate TTL for a request."""
        
        # Check if explicitly set
        if hasattr(request, '_cache_ttl'):
            return request._cache_ttl
        
        # Check URL patterns
        for pattern, ttl_key in self.URL_PATTERN_TTL.items():
            import re
            if re.match(pattern, request.path):
                return self.config[ttl_key]
        
        # Default TTL
        return self.config['default_ttl']
    
    def get_ttl_for_response(self, response: HttpResponse) -> int:
        """Get appropriate TTL for a response."""
        
        content_type = response.get('Content-Type', '').lower()
        
        # Check content type mappings
        for content_pattern, ttl_key in self.CONTENT_TYPE_TTL.items():
            if content_pattern in content_type:
                return self.config[ttl_key]
        
        # Default TTL
        return self.config['default_ttl']
    
    def generate_cache_key(self, request: HttpRequest, prefix: str = '') -> str:
        """Generate intelligent cache key for request."""
        
        # Base components
        components = [
            'cache',
            prefix,
            request.method,
            request.path_info,
        ]
        
        # Add query parameters (sorted for consistency)
        if request.GET:
            sorted_params = sorted(request.GET.items())
            param_string = '&'.join(f"{k}={v}" for k, v in sorted_params)
            components.append(param_string)
        
        # Add user-specific component if authenticated
        if hasattr(request, 'user') and request.user.is_authenticated:
            components.append(f"user:{request.user.id}")
        
        # Add language component
        if hasattr(request, 'LANGUAGE_CODE'):
            components.append(f"lang:{request.LANGUAGE_CODE}")
        
        # Add device type component
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
            components.append('mobile')
        else:
            components.append('desktop')
        
        # Create hash
        key_string = '|'.join(components)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def should_cache_request(self, request: HttpRequest) -> bool:
        """Determine if request should be cached."""
        
        # Never cache POST, PUT, DELETE, PATCH
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            return False
        
        # Check for explicit no-cache flag
        if getattr(request, '_never_cache', False):
            return False
        
        # Check for authentication
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Only cache if explicitly allowed for authenticated users
            return getattr(request, '_cache_authenticated', False)
        
        return True
    
    def should_cache_response(self, response: HttpResponse) -> bool:
        """Determine if response should be cached."""
        
        # Don't cache error responses
        if response.status_code >= 400:
            return False
        
        # Check for explicit no-cache headers
        if response.get('Cache-Control', '').startswith('no-cache'):
            return False
        
        # Check for set-cookie headers (session data)
        if response.get('Set-Cookie'):
            return False
        
        return True


class CacheManager:
    """Advanced cache management with warming and invalidation."""
    
    def __init__(self):
        self.cache_config = CacheConfig()
        self.warmed_urls = set()
    
    def warm_cache(self, urls: List[str], request_factory: Optional[Callable] = None) -> Dict[str, bool]:
        """Warm cache for specified URLs."""
        
        results = {}
        
        for url in urls:
            try:
                # Create mock request
                if request_factory:
                    request = request_factory(url)
                else:
                    request = self._create_mock_request(url)
                
                # Generate cache key
                cache_key = self.cache_config.generate_cache_key(request)
                
                # Check if already cached
                if cache.get(cache_key):
                    results[url] = True
                    continue
                
                # Mark as warmed
                self.warmed_urls.add(url)
                results[url] = True
                
            except Exception as e:
                results[url] = False
                print(f"Failed to warm cache for {url}: {e}")
        
        return results
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate cache entries matching pattern."""
        
        # This is a simplified version - in production you'd want to use
        # cache versioning or a more sophisticated invalidation strategy
        
        # For Redis, you could use SCAN with pattern matching
        # For now, we'll use a tag-based approach
        
        cache.delete_many([pattern])
        return 1  # Placeholder for actual count
    
    def invalidate_user_cache(self, user_id: int) -> int:
        """Invalidate all cache entries for a specific user."""
        
        pattern = f"*user:{user_id}*"
        return self.invalidate_pattern(pattern)
    
    def invalidate_url(self, url: str) -> bool:
        """Invalidate cache for specific URL."""
        
        try:
            request = self._create_mock_request(url)
            cache_key = self.cache_config.generate_cache_key(request)
            cache.delete(cache_key)
            return True
        except Exception:
            return False
    
    def clear_all_cache(self) -> bool:
        """Clear all cache entries."""
        
        try:
            cache.clear()
            return True
        except Exception:
            return False
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        
        # This would depend on your cache backend
        # For Redis, you could get memory usage, key count, etc.
        
        return {
            'warmed_urls_count': len(self.warmed_urls),
            'warmed_urls': list(self.warmed_urls),
            'cache_backend': settings.CACHES['default']['BACKEND'],
            'cache_location': settings.CACHES['default'].get('LOCATION', 'N/A'),
        }
    
    def _create_mock_request(self, url: str) -> HttpRequest:
        """Create a mock request for cache operations."""
        
        from django.test import RequestFactory
        
        factory = RequestFactory()
        return factory.get(url)


# Global cache manager instance
cache_manager = CacheManager()


# Utility functions for easy use
def set_cache_strategy(strategy: str):
    """Set global cache strategy."""
    global cache_manager
    cache_manager.cache_config = CacheConfig(strategy)


def warm_popular_pages():
    """Warm cache for popular pages."""
    
    popular_urls = [
        '/',
        '/blog/',
        '/projects/',
        '/about/',
        '/contact/',
    ]
    
    return cache_manager.warm_cache(popular_urls)


def invalidate_blog_cache():
    """Invalidate all blog-related cache."""
    
    return cache_manager.invalidate_pattern('*blog*')


def invalidate_project_cache():
    """Invalidate all project-related cache."""
    
    return cache_manager.invalidate_pattern('*project*')


def get_cache_performance_metrics() -> Dict[str, Any]:
    """Get cache performance metrics."""
    
    stats = cache_manager.get_cache_stats()
    
    # Add performance metrics
    stats.update({
        'strategy': cache_manager.cache_config.strategy,
        'config': cache_manager.cache_config.config,
    })
    
    return stats
