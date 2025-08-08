from django.http import (HttpResponseBadRequest, HttpResponseForbidden,
                         HttpResponseNotFound, HttpResponseServerError)
from django.shortcuts import render


class CustomErrorHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Handle 404
        if response.status_code == 404:
            return self.handle_error(request, 404)

        # Handle 500
        if response.status_code == 500:
            return self.handle_error(request, 500)

        # Handle 403
        if response.status_code == 403:
            return self.handle_error(request, 403)

        # Handle 400
        if response.status_code == 400:
            return self.handle_error(request, 400)

        return response

    def handle_error(self, request, error_code):
        error_data = {
            400: {
                'title': 'Bad Request',
                'message': 'The request you made is invalid.',
                'view': 'app.views.errors.error_400_view',
                'image': 'assets/images/errors/400.png',
            },
            403: {
                'title': 'Permission Denied',
                'message': 'You do not have permission to access this resource.',
                'view': 'app.views.errors.error_403_view',
                'image': 'assets/images/errors/403.png',
            },
            404: {
                'title': 'Not Found',
                'message': 'The page or resource you are looking for does not exist.',
                'view': 'app.views.errors.error_404_view',
                'image': 'assets/images/errors/404.png',
            },
            500: {
                'title': 'Internal Server Error',
                'message': 'The server encountered an internal error.',
                'view': 'app.views.errors.error_500_view',
                'image': 'assets/images/errors/500.png',
            },
        }

        error_info = error_data.get(error_code)
        if error_info:
            return render(
                request,
                'errors/http_errors.html',
                {
                    'error_code': error_code,
                    'error_title': error_info['title'],
                    'error_message': error_info['message'],
                    'error_image': error_info['image']
                },
                status=error_code
            )

        return HttpResponseServerError("An unexpected error occurred.")
