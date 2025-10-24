"""
Advanced Cache Settings Configuration
====================================

This module provides comprehensive cache settings for different environments
with intelligent cache strategies and exclusions.
"""

import os
from django.conf import settings


# Cache strategies for different environments
CACHE_STRATEGIES = {
    'development': {
        'strategy': 'CONSERVATIVE',
        'ttl': {
            'default': 60,      # 1 minute
            'static': 300,      # 5 minutes
            'dynamic': 30,      # 30 seconds
            'api': 15,          # 15 seconds
        },
        'enabled': True,
        'debug': True,
    },
    
    'staging': {
        'strategy': 'BALANCED',
        'ttl': {
            'default': 1800,    # 30 minutes
            'static': 43200,    # 12 hours
            'dynamic': 600,     # 10 minutes
            'api': 120,         # 2 minutes
        },
        'enabled': True,
        'debug': False,
    },
    
    'production': {
        'strategy': 'AGGRESSIVE',
        'ttl': {
            'default': 3600,    # 1 hour
            'static': 86400,    # 24 hours
            'dynamic': 300,     # 5 minutes
            'api': 60,          # 1 minute
        },
        'enabled': True,
        'debug': False,
    },
}

# Get current environment
ENVIRONMENT = os.environ.get('DJANGO_ENV', 'development').lower()
CACHE_CONFIG = CACHE_STRATEGIES.get(ENVIRONMENT, CACHE_STRATEGIES['development'])

# Basic cache settings
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = CACHE_CONFIG['ttl']['default']
CACHE_MIDDLEWARE_KEY_PREFIX = 'portfolio'
USE_CACHE = CACHE_CONFIG['enabled']

# Cache TTL settings
CACHE_DYNAMIC_PAGES = CACHE_CONFIG['ttl']['dynamic']
CACHE_STATIC_PAGES = CACHE_CONFIG['ttl']['static']
CACHE_API_PAGES = CACHE_CONFIG['ttl']['api']
CACHE_DEFAULT_TTL = CACHE_CONFIG['ttl']['default']

# Cache exclusion settings
CACHE_MIDDLEWARE_ANONYMOUS_ONLY = True
CACHE_MIDDLEWARE_SKIP_STATUSES = (400, 401, 403, 404, 500)

# Intelligent cache settings
INTELLIGENT_CACHE = {
    'enabled': True,
    'strategy': CACHE_CONFIG['strategy'],
    'debug': CACHE_CONFIG['debug'],
    'exclude_authenticated': True,
    'exclude_forms': True,
    'exclude_captcha': True,
    'exclude_admin': True,
    'exclude_api_auth': True,
    'exclude_dynamic_content': True,
}

# Cache warming settings
CACHE_WARMING = {
    'enabled': ENVIRONMENT == 'production',
    'popular_pages': [
        '/',
        '/blog/',
        '/projects/',
        '/about/',
        '/contact/',
    ],
    'auto_warm_on_startup': ENVIRONMENT == 'production',
}

# Cache invalidation settings
CACHE_INVALIDATION = {
    'enabled': True,
    'invalidate_on_content_change': True,
    'invalidate_on_user_action': True,
    'batch_invalidation': True,
    'invalidation_timeout': 30,  # seconds
}

# Redis cache configuration
def get_redis_cache_config():
    """Get Redis cache configuration based on environment."""
    
    if ENVIRONMENT == 'production':
        REDIS_URL = os.environ.get("REDIS_URL", "")
        REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")
    else:
        # Development Redis configuration
        from app.views.helpers.helpers import get_redis_creds
        REDIS_URL = get_redis_creds()[0]
        REDIS_PASSWORD = get_redis_creds()[1]
    
    return {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL if REDIS_URL.startswith("redis://") else f"redis://{REDIS_URL}",
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "PASSWORD": REDIS_PASSWORD,
                "SOCKET_CONNECT_TIMEOUT": 30,
                "SOCKET_TIMEOUT": 60,
                "SOCKET_KEEPALIVE": True,
                "SOCKET_KEEPALIVE_OPTIONS": {
                    "TCP_KEEPIDLE": 1,
                    "TCP_KEEPINTVL": 1,
                    "TCP_KEEPCNT": 5
                },
                "CONNECTION_POOL_KWARGS": {
                    "max_connections": 20,
                    "retry_on_timeout": True,
                    "socket_keepalive": True
                }
            },
            "KEY_PREFIX": "portfolio",
            "VERSION": 1,
            "TIMEOUT": CACHE_DEFAULT_TTL,
        }
    }

# Session cache configuration
SESSION_CACHE_ALIAS = "default"
SESSION_ENGINE = "django.contrib.sessions.backends.cache"

# Cache headers for different content types
CACHE_HEADERS = {
    'html': {
        'Cache-Control': f'public, max-age={CACHE_DYNAMIC_PAGES}',
        'Vary': 'Accept-Encoding, Cookie',
    },
    'api': {
        'Cache-Control': f'private, max-age={CACHE_API_PAGES}',
        'Vary': 'Authorization',
    },
    'static': {
        'Cache-Control': f'public, max-age={CACHE_STATIC_PAGES}',
        'Expires': f'{CACHE_STATIC_PAGES}',
    },
    'no_cache': {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
}

# URL patterns that should never be cached
NEVER_CACHE_PATTERNS = [
    # Authentication
    r'^/login/?$',
    r'^/signup/?$',
    r'^/register/?$',
    r'^/logout/?$',
    r'^/password-reset/?$',
    r'^/auth/',
    
    # Forms with captcha
    r'^/contact/?$',
    r'^/contact/submit/?$',
    r'^/message/?$',
    r'^/inbox/?$',
    
    # Captcha endpoints
    r'^/captcha/',
    r'^/refresh-captcha/?$',
    r'^/api/captcha/',
    
    # Admin
    r'^/admin/',
    r'^/wagtail/',
    
    # Dynamic content creation
    r'^/blog/article/new/?$',
    r'^/blog/article/.+/edit/?$',
    r'^/projects/new/?$',
    r'^/projects/.+/edit/?$',
    
    # API with authentication
    r'^/api/v1/auth/',
    r'^/api/v1/login/',
    r'^/api/v1/contact/',
    
    # Session management
    r'^/session/?$',
    r'^/api/session/',
    
    # User-specific content
    r'^/dashboard/?$',
    r'^/profile/?$',
    r'^/account/?$',
]

# URL patterns with specific cache TTL
CACHE_TTL_PATTERNS = {
    r'^/static/': CACHE_STATIC_PAGES,
    r'^/media/': CACHE_STATIC_PAGES,
    r'^/api/': CACHE_API_PAGES,
    r'^/blog/': CACHE_DYNAMIC_PAGES,
    r'^/projects/': CACHE_DYNAMIC_PAGES,
    r'^/$': CACHE_DEFAULT_TTL,
}

# Content type cache mappings
CONTENT_TYPE_CACHE = {
    'text/html': CACHE_DYNAMIC_PAGES,
    'text/css': CACHE_STATIC_PAGES,
    'application/javascript': CACHE_STATIC_PAGES,
    'image/': CACHE_STATIC_PAGES,
    'application/json': CACHE_API_PAGES,
    'text/plain': CACHE_DEFAULT_TTL,
}

# Cache debugging settings
CACHE_DEBUG = {
    'enabled': INTELLIGENT_CACHE['debug'],
    'log_misses': True,
    'log_hits': True,
    'log_exclusions': True,
    'add_headers': True,
}

# Performance monitoring
CACHE_PERFORMANCE = {
    'enabled': ENVIRONMENT == 'production',
    'metrics_collection': True,
    'slow_query_threshold': 100,  # milliseconds
    'hit_rate_monitoring': True,
}

# Export settings for Django
CACHES = get_redis_cache_config()

# Add cache configuration to Django settings
if not hasattr(settings, 'CACHE_CONFIG'):
    settings.CACHE_CONFIG = CACHE_CONFIG

if not hasattr(settings, 'INTELLIGENT_CACHE'):
    settings.INTELLIGENT_CACHE = INTELLIGENT_CACHE

if not hasattr(settings, 'CACHE_WARMING'):
    settings.CACHE_WARMING = CACHE_WARMING

if not hasattr(settings, 'CACHE_INVALIDATION'):
    settings.CACHE_INVALIDATION = CACHE_INVALIDATION
