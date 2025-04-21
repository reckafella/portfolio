import datetime
from django.views import View
from django.conf import settings
from django.utils.timezone import now
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin


class SessionManagementView(LoginRequiredMixin, View):
    """
    Handles session management for checking and updating session expiration.
    * Inherits from LoginRequiredMixin to ensure the user is authenticated.
    """
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
        try:
            request.session['last_activity'] = now().isoformat()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


"""
from django.http import JsonResponse
from django.utils.timezone import now
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import datetime

@login_required
def check_session(request):
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

@login_required
def update_session(request):
    try:
        request.session['last_activity'] = now().isoformat()
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
"""
