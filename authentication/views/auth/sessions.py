import datetime
import time
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from django.views import View
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from portfolio.utils.rate_limiting import check_auth_rate_limit


class ManageSessionView(LoginRequiredMixin, View):
    """
    Handles session management for checking and updating session expiration.
    Enhanced with security and rate limiting.
    """
    
    @method_decorator(never_cache)
    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        """
        Apply security decorators and check rate limits.
        """
        # Check rate limiting first
        request = args[0] if args else kwargs.get('request')
        if request:
            is_limited, info = check_auth_rate_limit(request)
            if is_limited:
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'retry_after': info.get('reset_time', 3600)
                }, status=429)
        
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        """
        Check the session expiration time and return the remaining time.
        Only works for authenticated users.
        """
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            current_time = now()
            last_activity = request.session.get('last_activity')

            if not last_activity:
                # Initialize session activity tracking
                last_activity = current_time
                request.session['last_activity'] = current_time.isoformat()
                request.session.modified = True
            else:
                # Parse stored timestamp
                if isinstance(last_activity, str):
                    last_activity = datetime.datetime.fromisoformat(last_activity)
                elif not isinstance(last_activity, datetime.datetime):
                    # Fallback for other formats
                    last_activity = current_time

            # Calculate remaining session time
            idle_time = (current_time - last_activity).total_seconds()
            session_age = settings.SESSION_COOKIE_AGE
            time_left = session_age - int(idle_time)

            # Add session metadata
            response_data = {
                'expires_in': max(0, time_left),
                'session_age': session_age,
                'last_activity': last_activity.isoformat(),
                'is_authenticated': True
            }

            return JsonResponse(response_data)
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error in session GET for user {request.user.id}: {str(e)}')
            return JsonResponse({'error': 'Session check failed'}, status=500)

    def post(self, request):
        """
        Update the session expiration time with enhanced security.
        """
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        user_id = request.user.id
        
        # Rate limiting with per-user cache key
        cache_key = f'session_update_{user_id}'
        last_update = cache.get(cache_key)
        
        # Prevent too frequent updates (max once per 30 seconds per user)
        if last_update:
            time_since_last = time.time() - last_update
            if time_since_last < 30:
                return JsonResponse({
                    'status': 'rate_limited',
                    'retry_after': int(30 - time_since_last)
                }, status=429)
        
        try:
            current_time = now()
            
            # Update session activity
            request.session['last_activity'] = current_time.isoformat()
            request.session.modified = True
            
            # Set cache to prevent rapid updates
            cache.set(cache_key, time.time(), 60)  # 1 minute cache
            
            # Calculate new expiration time
            session_age = settings.SESSION_COOKIE_AGE
            expires_in = session_age
            
            response_data = {
                'status': 'success',
                'expires_in': expires_in,
                'updated_at': current_time.isoformat()
            }
            
            return JsonResponse(response_data)
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error in session POST for user {user_id}: {str(e)}')
            return JsonResponse({'error': 'Session update failed'}, status=500)
