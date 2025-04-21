import datetime
from django.views import View
from django.conf import settings
from django.core.cache import cache
from django.utils.timezone import now
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.contrib.auth.mixins import LoginRequiredMixin


class SessionManagementView(LoginRequiredMixin, View):
    """
    Handles session management for checking and updating session expiration.
    * Inherits from LoginRequiredMixin to ensure the user is authenticated.
    """
    @method_decorator(never_cache)
    def dispatch(self, *args, **kwargs):
        """
        Decorator to prevent caching of the session management view.
        """
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        """
        Check the session expiration time and return the remaining time.
        """
        try:
            current_time = now()
            last_activity = request.session.get('last_activity')

            if not last_activity:
                last_activity = current_time
                request.session['last_activity'] = current_time.isoformat()
            else:
                last_activity = datetime.datetime.fromisoformat(last_activity)

            idle_time = (current_time - last_activity).total_seconds()
            time_left = settings.SESSION_COOKIE_AGE - int(idle_time)

            return JsonResponse({'expires_in': max(0, time_left)})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    def post(self, request):
        """ Update the session expiration time. """
        user_id = request.user.id
        cache_key = f'session_update_{user_id}'

        if cache.get(cache_key):
            return JsonResponse({'status': 'skipped'}, status=200)
        try:
            request.session['last_activity'] = int(now().timestamp())
            request.session.modified = True
            cache.set(cache_key, True, 30)
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
