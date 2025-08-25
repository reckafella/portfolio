import os
import mimetypes
from django.views.generic import View
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


@method_decorator(csrf_exempt, name='dispatch')
class FrontendAPIView(View):
    """
    Serve React frontend built files.
    Handles both the main index.html and static assets.
    """

    def get(self, request, *args, **kwargs):
        # Get the path from the request
        path = request.path.lstrip('/')

        # Handle static assets (CSS, JS, images, etc.)
        if path.startswith('assets/'):
            return self.serve_static_file(path)

        # Handle favicon
        if path == 'favicon.svg' or path == 'favicon.ico':
            return self.serve_static_file(path)

        # For all other paths (including React routes), serve index.html
        return self.serve_index()

    def serve_static_file(self, path):
        """Serve static files from the React build directory."""
        file_path = os.path.join(settings.BASE_DIR, 'frontend/build', path)

        if not os.path.exists(file_path):
            raise Http404(f"Static file not found: {path}")

        try:
            with open(file_path, 'rb') as f:
                content = f.read()

            # Determine content type
            content_type, _ = mimetypes.guess_type(file_path)
            if content_type is None:
                content_type = 'application/octet-stream'

            response = HttpResponse(content, content_type=content_type)

            # Add caching headers for static assets
            if path.startswith('assets/'):
                response['Cache-Control'] = 'public, max-age=31536000'  # 1 year

            return response

        except IOError:
            raise Http404(f"Could not read file: {path}")

    def serve_index(self):
        """Serve the main React index.html file."""
        index_path = os.path.join(settings.BASE_DIR, 'frontend/build/index.html')

        if not os.path.exists(index_path):
            return HttpResponse(
                'React frontend not built. Run "npm run build" from the frontend directory.',
                status=503,
                content_type='text/plain'
            )

        try:
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Replace asset paths to work with Django's static file serving
            content = content.replace(
                '/assets/',
                f'{settings.STATIC_URL}assets/' if not settings.DEBUG else '/assets/'
            )

            response = HttpResponse(content, content_type='text/html')
            # Don't cache the main HTML file
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'

            return response

        except IOError:
            return HttpResponse(
                'Error reading React frontend files.',
                status=500,
                content_type='text/plain'
            )
