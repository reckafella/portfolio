from django.http import JsonResponse
from django.utils.timezone import now
from django.contrib.auth.decorators import login_required
from django.conf import settings


@login_required
def check_session(request):
    last_activity = request.session.get('last_activity')
    if not last_activity:
        last_activity = now()
        request.session['last_activity'] = last_activity
    
    idle_time = (now() - last_activity).seconds
    time_left = settings.SESSION_COOKIE_AGE - idle_time
    
    return JsonResponse({'expires_in': max(0, time_left)})


@login_required
def update_session(request):
    if request.method == 'POST':
        request.session['last_activity'] = now()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=405)