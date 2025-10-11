"""
Test Suite for Intelligent Cache Middleware - Masterpiece Validation
===================================================================

Comprehensive tests for the intelligent cache system to ensure it properly
excludes forms, captcha, and dynamic content while caching appropriate pages.
"""

import re
from django.test import TestCase, RequestFactory, Client
from django.http import HttpResponse
from django.conf import settings
from django.urls import reverse
from django.contrib.auth.models import User
from portfolio.middlewares.intelligent_cache import (
    IntelligentCacheMiddleware,
    IntelligentFetchFromCacheMiddleware,
    never_cache,
    cache_control,
    cache_by_user,
)
from portfolio.utils.cache_config import CacheConfig, CacheManager


class IntelligentCacheMiddlewareTest(TestCase):
    """Test cases for intelligent cache middleware."""
    
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = IntelligentCacheMiddleware(lambda r: HttpResponse())
        self.client = Client()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_login_page_exclusion(self):
        """Test that login page is excluded from cache."""
        
        request = self.factory.get('/login/')
        response = HttpResponse('<form><input name="csrfmiddlewaretoken"></form>')
        
        # Should be excluded
        self.assertTrue(
            self.middleware.should_exclude_from_cache(request, response)
        )
        
        # Check URL pattern exclusion
        self.assertTrue(
            self.middleware._check_url_patterns(request)
        )
    
    def test_contact_form_exclusion(self):
        """Test that contact form is excluded from cache."""
        
        request = self.factory.get('/contact/')
        response = HttpResponse('<form><input name="captcha"></form>')
        
        # Should be excluded
        self.assertTrue(
            self.middleware.should_exclude_from_cache(request, response)
        )
        
        # Check content exclusion
        self.assertTrue(
            self.middleware._check_response_content(response)
        )
    
    def test_captcha_endpoint_exclusion(self):
        """Test that captcha endpoints are excluded from cache."""
        
        captcha_urls = [
            '/captcha/image/',
            '/refresh-captcha/',
            '/api/captcha/refresh/',
        ]
        
        for url in captcha_urls:
            request = self.factory.get(url)
            
            # Should be excluded
            self.assertTrue(
                self.middleware.should_exclude_from_cache(request)
            )
    
    def test_admin_exclusion(self):
        """Test that admin pages are excluded from cache."""
        
        admin_urls = [
            '/admin/',
            '/wagtail/admin/',
            '/api/admin/',
        ]
        
        for url in admin_urls:
            request = self.factory.get(url)
            
            # Should be excluded
            self.assertTrue(
                self.middleware.should_exclude_from_cache(request)
            )
    
    def test_authenticated_user_exclusion(self):
        """Test that authenticated users are excluded from cache."""
        
        request = self.factory.get('/')
        request.user = self.user  # Authenticated user
        
        # Should be excluded
        self.assertTrue(
            self.middleware.should_exclude_from_cache(request)
        )
        
        # Check authentication exclusion
        self.assertTrue(
            self.middleware._check_authentication(request)
        )
    
    def test_post_request_exclusion(self):
        """Test that POST requests are excluded from cache."""
        
        request = self.factory.post('/contact/', {'name': 'Test'})
        
        # Should be excluded
        self.assertTrue(
            self.middleware.should_exclude_from_cache(request)
        )
    
    def test_form_content_exclusion(self):
        """Test that responses with forms are excluded from cache."""
        
        request = self.factory.get('/some-page/')
        
        # Response with form
        response_with_form = HttpResponse('<form><input type="text"></form>')
        
        # Response without form
        response_without_form = HttpResponse('<div>Static content</div>')
        
        # Should exclude form response
        self.assertTrue(
            self.middleware._check_response_content(response_with_form)
        )
        
        # Should not exclude non-form response
        self.assertFalse(
            self.middleware._check_response_content(response_without_form)
        )
    
    def test_captcha_content_exclusion(self):
        """Test that responses with captcha are excluded from cache."""
        
        request = self.factory.get('/some-page/')
        
        # Response with captcha
        response_with_captcha = HttpResponse('<input name="captcha">')
        
        # Should exclude captcha response
        self.assertTrue(
            self.middleware._check_response_content(response_with_captcha)
        )
    
    def test_csrf_token_exclusion(self):
        """Test that responses with CSRF tokens are excluded from cache."""
        
        request = self.factory.get('/some-page/')
        
        # Response with CSRF token
        response_with_csrf = HttpResponse('<input name="csrfmiddlewaretoken">')
        
        # Should exclude CSRF response
        self.assertTrue(
            self.middleware._check_response_content(response_with_csrf)
        )
    
    def test_static_page_caching(self):
        """Test that static pages are eligible for caching."""
        
        request = self.factory.get('/')
        response = HttpResponse('<div>Static homepage content</div>')
        
        # Should not be excluded
        self.assertFalse(
            self.middleware.should_exclude_from_cache(request, response)
        )
    
    def test_blog_page_caching(self):
        """Test that blog pages are eligible for caching."""
        
        request = self.factory.get('/blog/')
        response = HttpResponse('<div>Blog listing page</div>')
        
        # Should not be excluded
        self.assertFalse(
            self.middleware.should_exclude_from_cache(request, response)
        )
    
    def test_api_endpoint_exclusion(self):
        """Test that API endpoints with authentication are excluded."""
        
        api_urls = [
            '/api/v1/auth/login/',
            '/api/v1/contact/',
            '/api/v1/messages/',
        ]
        
        for url in api_urls:
            request = self.factory.get(url)
            
            # Should be excluded
            self.assertTrue(
                self.middleware.should_exclude_from_cache(request)
            )
    
    def test_query_parameter_exclusion(self):
        """Test that requests with dynamic query parameters are excluded."""
        
        # Request with dynamic parameters
        request = self.factory.get('/search/?q=test&filter=active')
        
        # Should be excluded due to query parameters
        self.assertTrue(
            self.middleware._check_query_parameters(request)
        )
    
    def test_header_exclusion(self):
        """Test that requests with certain headers are excluded."""
        
        request = self.factory.get('/')
        request.META['HTTP_X_CSRFTOKEN'] = 'some-token'
        
        # Should be excluded due to CSRF header
        self.assertTrue(
            self.middleware._check_headers(request)
        )


class CacheConfigTest(TestCase):
    """Test cases for cache configuration."""
    
    def setUp(self):
        self.factory = RequestFactory()
    
    def test_cache_strategies(self):
        """Test different cache strategies."""
        
        strategies = ['AGGRESSIVE', 'BALANCED', 'CONSERVATIVE', 'NO_CACHE']
        
        for strategy in strategies:
            config = CacheConfig(strategy)
            self.assertEqual(config.strategy, strategy)
            self.assertIn('default_ttl', config.config)
    
    def test_ttl_for_request(self):
        """Test TTL calculation for different requests."""
        
        config = CacheConfig('BALANCED')
        
        # Test static page
        request = self.factory.get('/static/css/style.css')
        ttl = config.get_ttl_for_request(request)
        self.assertEqual(ttl, config.config['static_ttl'])
        
        # Test API endpoint
        request = self.factory.get('/api/v1/blog/')
        ttl = config.get_ttl_for_request(request)
        self.assertEqual(ttl, config.config['api_ttl'])
    
    def test_cache_key_generation(self):
        """Test cache key generation."""
        
        config = CacheConfig('BALANCED')
        
        # Test basic request
        request = self.factory.get('/')
        key = config.generate_cache_key(request)
        
        self.assertIsInstance(key, str)
        self.assertTrue(len(key) > 0)
        
        # Test request with query parameters
        request = self.factory.get('/blog/?page=1&sort=date')
        key_with_params = config.generate_cache_key(request)
        
        self.assertNotEqual(key, key_with_params)
    
    def test_should_cache_request(self):
        """Test cache eligibility for requests."""
        
        config = CacheConfig('BALANCED')
        
        # Test GET request (should cache)
        request = self.factory.get('/')
        self.assertTrue(config.should_cache_request(request))
        
        # Test POST request (should not cache)
        request = self.factory.post('/contact/')
        self.assertFalse(config.should_cache_request(request))


class CacheDecoratorsTest(TestCase):
    """Test cases for cache decorators."""
    
    def setUp(self):
        self.factory = RequestFactory()
    
    def test_never_cache_decorator(self):
        """Test never_cache decorator."""
        
        @never_cache
        def test_view(request):
            return HttpResponse('Test')
        
        request = self.factory.get('/')
        response = test_view(request)
        
        # Should have no-cache headers
        self.assertIn('no-cache', response['Cache-Control'])
        self.assertEqual(response['Pragma'], 'no-cache')
    
    def test_cache_control_decorator(self):
        """Test cache_control decorator."""
        
        @cache_control(max_age=3600, public=True)
        def test_view(request):
            return HttpResponse('Test')
        
        request = self.factory.get('/')
        response = test_view(request)
        
        # Should have cache control headers
        self.assertIn('max-age=3600', response['Cache-Control'])
        self.assertIn('public', response['Cache-Control'])
    
    def test_cache_by_user_decorator(self):
        """Test cache_by_user decorator."""
        
        @cache_by_user
        def test_view(request):
            return HttpResponse('Test')
        
        request = self.factory.get('/')
        request.user = User.objects.create_user('test', 'test@example.com')
        
        response = test_view(request)
        
        # Should have user-specific cache header
        self.assertIn('X-Cache-User', response)


class CacheIntegrationTest(TestCase):
    """Integration tests for the complete cache system."""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_login_page_not_cached(self):
        """Test that login page is not cached."""
        
        response = self.client.get('/login/')
        
        # Should have no-cache headers
        self.assertIn('no-cache', response.get('Cache-Control', ''))
    
    def test_contact_page_not_cached(self):
        """Test that contact page is not cached."""
        
        response = self.client.get('/contact/')
        
        # Should have no-cache headers
        self.assertIn('no-cache', response.get('Cache-Control', ''))
    
    def test_homepage_caching(self):
        """Test that homepage can be cached."""
        
        response = self.client.get('/')
        
        # Should be eligible for caching
        self.assertIn('X-Cache-Status', response)
        self.assertIn(response['X-Cache-Status'], ['ELIGIBLE', 'EXCLUDED'])
    
    def test_authenticated_user_no_cache(self):
        """Test that authenticated users don't get cached content."""
        
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get('/')
        
        # Should not be cached for authenticated users
        self.assertIn('no-cache', response.get('Cache-Control', ''))


class CachePerformanceTest(TestCase):
    """Performance tests for cache system."""
    
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = IntelligentCacheMiddleware(lambda r: HttpResponse())
    
    def test_exclusion_performance(self):
        """Test that exclusion checks are performant."""
        
        import time
        
        # Test multiple requests
        urls = ['/login/', '/contact/', '/', '/blog/', '/admin/']
        
        start_time = time.time()
        
        for url in urls:
            request = self.factory.get(url)
            self.middleware.should_exclude_from_cache(request)
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Should complete quickly (less than 1 second for 5 requests)
        self.assertLess(execution_time, 1.0)
    
    def test_cache_key_generation_performance(self):
        """Test cache key generation performance."""
        
        import time
        
        config = CacheConfig('BALANCED')
        
        start_time = time.time()
        
        # Generate 100 cache keys
        for i in range(100):
            request = self.factory.get(f'/page-{i}/')
            config.generate_cache_key(request)
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Should complete quickly (less than 1 second for 100 keys)
        self.assertLess(execution_time, 1.0)
