import hashlib
import json

from django.core.cache import cache
from django.db.models import Q
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from django.views.generic import DetailView

from app.views.helpers.helpers import is_ajax
from blog.models import BlogPostPage, ViewCountAttempt


@method_decorator(require_http_methods(["POST"]), name='dispatch')
class IncrementViewCountView(DetailView):
    """
    Increment the view count for a blog post using ajax.
    This view is intended to be called via AJAX to update the view count
    It is protected against abuse by checking the request method
    """
    model = BlogPostPage

    def post(self, request, *args, **kwargs):
        article = self.get_object()
        client_ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Check if the article exists
        if not article:
            return JsonResponse(
                {'success': False, 'error': 'Article not found'}, status=404)
        # Log the view count attempt
        attempt = ViewCountAttempt.objects.create(
            article=article,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            reason='Initial attempt'
        )

        try:
            if not self.validate_csrf(request):
                attempt.reason = 'Invalid CSRF token'
                attempt.save()
                return JsonResponse(
                    {'success': False, 'error': 'Invalid CSRF token'},
                    status=403)

            # Validate the request
            if not is_ajax(request):
                attempt.reason = 'Invalid request type'
                attempt.save()
                return JsonResponse(
                    {'success': False, 'error': 'Invalid request'}, status=405)

            if not self.validate_payload(request):
                attempt.reason = 'Invalid payload'
                attempt.save()
                return JsonResponse(
                    {'success': False, 'error': 'Invalid payload'}, status=400)

            if not self.check_rate_limit(request, article):
                attempt.reason = 'Rate limit exceeded'
                attempt.save()
                return JsonResponse({'success': False,
                                     'error': 'Rate limit exceeded'},
                                    status=429)

            if not self.validate_referer(request, article):
                attempt.reason = 'Invalid referer'
                attempt.save()
                return JsonResponse(
                    {'success': False, 'error': 'Invalid referer'}, status=403)

            if self.page_already_viewed(request, article):
                attempt.reason = 'Page already viewed'
                attempt.success = False
                attempt.save()
                return JsonResponse({
                    'success': False, 'message': 'Page already viewed',
                    'view_count': article.view_count
                }, status=200)

            # Increment the view count
            article.increment_view_count()
            attempt.success = True
            attempt.reason = 'View count incremented successfully'
            attempt.save()
            self.mark_page_as_viewed(request, article)
            return JsonResponse({
                'success': True,
                'view_count': article.view_count,
                'message': 'View count incremented successfully'
            }, status=200)
        except Exception as e:
            # Log the error and return a server error response
            attempt.reason = f'Server error: {str(e)}'
            attempt.success = False
            attempt.save()
            return JsonResponse({
                'success': False,
                'error': f'Server Error: {str(e)}'}, status=404)

    def validate_csrf(self, request):
        """
        Validate CSRF token for AJAX requests.
        """
        from django.middleware.csrf import get_token

        midwaret = request.POST.get('csrfmiddlewaretoken')
        xcrsftoken = request.headers.get('X-CSRFToken')
        http_x_csrf_token = request.META.get('HTTP_X_CSRFTOKEN')

        expected_token = get_token(request)
        received_token = midwaret or xcrsftoken or http_x_csrf_token

        return expected_token == received_token

    def check_rate_limit(self, request, article):
        """
        Rate limit the number of view count increments
        to prevent abuse. This could be done using a cache or database.
        Returns True if the request is allowed, False otherwise.
        max 1 request per 10 seconds per user per post per IP.
        """
        import time

        client_ip = self.get_client_ip(request)
        cache_key = f"view_count_{article.pk}_{client_ip}"

        last_view_time = cache.get(cache_key)
        current_time = time.time()

        if last_view_time and (current_time - last_view_time) < 10:
            return False

        # Update the cache with the current time
        cache.set(cache_key, current_time, timeout=10)

        return True

    def get_client_ip(self, request):
        """
        Get the client's IP address from the request.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def validate_referer(self, request, article):
        """
        Validate that the request comes from the blog post page
        """
        referer = request.META.get('HTTP_REFERER')
        expected_path = f'/blog/{article.slug}'

        if not referer:
            return False

        # Check if the referer matches the article's URL
        return expected_path in referer

    def page_already_viewed(self, request, article):
        """
        Check if the page has already been viewed by this user.
        This could be done using a session or a cookie.
        """
        session_key = f"viewed_page_{article.slug}"
        if request.session.get(session_key, False):
            return True

        client_ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        identifier = hashlib.md5(
            f"{client_ip}_{user_agent}_{article.pk}".encode('utf-8')
        ).hexdigest()
        cache_key = f"viewed_page_{identifier}"

        if cache.get(cache_key):
            return True

        return False

    def mark_page_as_viewed(self, request, article):
        """
        Mark the page as viewed by this user.
        This could be done using a session or a cookie.
        """
        session_key = f"viewed_page_{article.slug}"
        request.session[session_key] = True

        client_ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        identifier = hashlib.md5(
            f"{client_ip}_{user_agent}_{article.pk}".encode('utf-8')
        ).hexdigest()
        cache_key = f"viewed_page_{identifier}"

        # Store the viewed page in the cache for 300 seconds
        cache.set(cache_key, True, timeout=300)

    def validate_payload(self, request):
        """
        Validate the payload of the request.
        This could be done using a JSON schema or a custom validation.
        """
        try:
            if hasattr(request, 'body') and request.body:
                data = json.loads(request.body) or request.body.decode('utf-8')
                return len(data) < 100
            return True
        except (ValueError, TypeError):
            return False

    def get_queryset(self):
        queryset = super().get_queryset().select_related('author')
        user = self.request.user
        if not user.is_authenticated:
            return queryset.filter(live=True)
        if not user.is_staff:
            return queryset.filter(Q(live=True) | Q(author=user))
        return queryset
