import os
from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings


class FrontendAPIView(View):
    _error = 'Build not found. Run "npm run build from within frontend/"'

    def get(self, request):
        try:
            with open(os.path.join(settings.BASE_DIR, 'frontend/build/index.html')) as f:
                return HttpResponse(f.read())
        except (FileNotFoundError, Exception):
            return HttpResponse(self._error, status=501)
