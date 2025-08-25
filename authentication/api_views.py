from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from app.views.helpers.helpers import is_ajax


@require_http_methods(["GET"])
def get_current_user(request):
    """Get current authenticated user data for React frontend"""
    if request.user.is_authenticated:
        user_data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'is_staff': request.user.is_staff,
        }
        return JsonResponse(user_data)
    else:
        return JsonResponse({'error': 'Not authenticated'}, status=401)


@login_required
@require_http_methods(["POST"])
@csrf_exempt
def update_auth_state(request):
    """Update authentication state after login/logout"""
    if is_ajax(request):
        return JsonResponse({
            'authenticated': request.user.is_authenticated,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'is_staff': request.user.is_staff,
            } if request.user.is_authenticated else None
        })
    return JsonResponse({'error': 'Invalid request'}, status=400)
