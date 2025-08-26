from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions


@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_csrf_token(request):
    """Get CSRF token for API requests"""
    return JsonResponse({'csrfToken': get_token(request)})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    """API endpoint to get CSRF token"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Return CSRF token"""
        return Response({'csrfToken': get_token(request)})
