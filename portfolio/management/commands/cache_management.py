"""
Cache Management Command - Masterpiece Cache Control
==================================================

This management command provides comprehensive cache management capabilities
including warming, invalidation, testing, and monitoring.
"""

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.test import RequestFactory
from django.urls import reverse
from portfolio.utils.cache_config import cache_manager, set_cache_strategy
from portfolio.middlewares.intelligent_cache import IntelligentCacheMiddleware
import time
import json


class Command(BaseCommand):
    help = 'Advanced cache management with intelligent controls'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['warm', 'clear', 'invalidate', 'test', 'stats', 'strategy'],
            help='Action to perform on cache'
        )

        parser.add_argument(
            '--strategy',
            choices=['AGGRESSIVE', 'BALANCED', 'CONSERVATIVE', 'NO_CACHE'],
            default='BALANCED',
            help='Cache strategy to use'
        )

        parser.add_argument(
            '--urls',
            nargs='+',
            help='Specific URLs to warm or invalidate'
        )

        parser.add_argument(
            '--pattern',
            type=str,
            help='Pattern to match for invalidation'
        )

        parser.add_argument(
            '--user-id',
            type=int,
            help='User ID for user-specific cache operations'
        )

        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Verbose output'
        )

    def handle(self, *args, **options):
        action = options['action']
        verbose = options['verbose']

        if verbose:
            self.stdout.write(
                self.style.SUCCESS(f'Performing cache action: {action}')
            )

        try:
            if action == 'warm':
                self.warm_cache(options)
            elif action == 'clear':
                self.clear_cache(options)
            elif action == 'invalidate':
                self.invalidate_cache(options)
            elif action == 'test':
                self.test_cache(options)
            elif action == 'stats':
                self.show_stats(options)
            elif action == 'strategy':
                self.set_strategy(options)

        except Exception as e:
            raise CommandError(f'Cache operation failed: {e}')

    def warm_cache(self, options):
        """Warm cache for specified URLs or popular pages."""

        urls = options.get('urls')
        if not urls:
            # Default popular pages
            urls = [
                '/',
                '/blog/',
                '/projects/',
                '/about/',
                '/contact/',
            ]

        self.stdout.write(
            self.style.SUCCESS(f'Warming cache for {len(urls)} URLs...')
        )

        results = cache_manager.warm_cache(urls)

        for url, success in results.items():
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Warmed: {url}')
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f'✗ Failed: {url}')
                )

    def clear_cache(self, options):
        """Clear all cache entries."""

        self.stdout.write(
            self.style.WARNING('Clearing all cache entries...')
        )

        success = cache_manager.clear_all_cache()

        if success:
            self.stdout.write(
                self.style.SUCCESS('✓ Cache cleared successfully')
            )
        else:
            self.stdout.write(
                self.style.ERROR('✗ Failed to clear cache')
            )

    def invalidate_cache(self, options):
        """Invalidate cache entries."""

        pattern = options.get('pattern')
        user_id = options.get('user_id')
        urls = options.get('urls')

        if pattern:
            self.stdout.write(
                self.style.SUCCESS(f'Invalidating cache for pattern: {pattern}')
            )
            count = cache_manager.invalidate_pattern(pattern)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Invalidated {count} entries')
            )

        elif user_id:
            self.stdout.write(
                self.style.SUCCESS(f'Invalidating cache for user: {user_id}')
            )
            count = cache_manager.invalidate_user_cache(user_id)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Invalidated {count} entries')
            )

        elif urls:
            self.stdout.write(
                self.style.SUCCESS(f'Invalidating cache for {len(urls)} URLs...')
            )
            for url in urls:
                success = cache_manager.invalidate_url(url)
                if success:
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Invalidated: {url}')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f'✗ Failed: {url}')
                    )
        else:
            raise CommandError(
                'Please specify --pattern, --user-id, or --urls for invalidation'
            )

    def test_cache(self, options):
        """Test cache functionality."""

        self.stdout.write(
            self.style.SUCCESS('Testing cache functionality...')
        )

        # Test URLs
        test_urls = [
            '/',
            '/blog/',
            '/projects/',
            '/contact/',
            '/login/',
        ]

        factory = RequestFactory()
        middleware = IntelligentCacheMiddleware(lambda r: None)

        results = {}

        for url in test_urls:
            request = factory.get(url)

            # Test cache exclusion logic
            should_exclude = middleware.should_exclude_from_cache(request)

            results[url] = {
                'should_exclude': should_exclude,
                'cache_status': 'EXCLUDED' if should_exclude else 'ELIGIBLE'
            }

            self.stdout.write(
                f'{url}: {results[url]["cache_status"]}'
            )

        # Test cache key generation
        self.stdout.write('\nTesting cache key generation...')

        for url in test_urls:
            request = factory.get(url)
            cache_key = cache_manager.cache_config.generate_cache_key(request)

            self.stdout.write(
                f'{url}: {cache_key[:20]}...'
            )

        self.stdout.write(
            self.style.SUCCESS('\n✓ Cache testing completed')
        )

    def show_stats(self, options):
        """Show cache statistics."""

        stats = cache_manager.get_cache_stats()

        self.stdout.write(
            self.style.SUCCESS('Cache Statistics:')
        )
        self.stdout.write('=' * 50)

        for key, value in stats.items():
            if isinstance(value, dict):
                self.stdout.write(f'{key}:')
                for sub_key, sub_value in value.items():
                    self.stdout.write(f'  {sub_key}: {sub_value}')
            else:
                self.stdout.write(f'{key}: {value}')

        # Show cache configuration
        self.stdout.write('\nCache Configuration:')
        self.stdout.write('=' * 50)

        cache_config = cache_manager.cache_config
        self.stdout.write(f'Strategy: {cache_config.strategy}')
        self.stdout.write(f'Config: {cache_config.config}')

        # Show intelligent cache settings
        if hasattr(settings, 'INTELLIGENT_CACHE'):
            self.stdout.write('\nIntelligent Cache Settings:')
            self.stdout.write('=' * 50)

            for key, value in settings.INTELLIGENT_CACHE.items():
                self.stdout.write(f'{key}: {value}')

    def set_strategy(self, options):
        """Set cache strategy."""

        strategy = options['strategy']

        self.stdout.write(
            self.style.SUCCESS(f'Setting cache strategy to: {strategy}')
        )

        set_cache_strategy(strategy)

        self.stdout.write(
            self.style.SUCCESS('✓ Cache strategy updated')
        )

        # Show new configuration
        cache_config = cache_manager.cache_config
        self.stdout.write(f'New strategy: {cache_config.strategy}')
        self.stdout.write(f'Configuration: {cache_config.config}')
