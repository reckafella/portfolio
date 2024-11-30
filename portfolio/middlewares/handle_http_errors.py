from django.shortcuts import render
from django.conf import settings


class CustomHttpErrorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code == 404:
            return self.handle_error(
                request,
                "404",
                "Not Found",
                "The resource you are looking for cannot be located.",
            )
        elif response.status_code == 500:
            return self.handle_error(
                request,
                "500",
                "Internal Server Error",
                "The server encountered an internal error. Try again later.",
            )
        elif response.status_code == 403:
            return self.handle_error(
                request,
                "403",
                "Permission Denied",
                "You do not have permission to access this page / resource.",
            )
        elif response.status_code == 400:
            return self.handle_error(
                request,
                "400",
                "Bad Request",
                "Invalid Request. Please check and try again.",
            )

        return response

    def handle_error(self, request, error_code, error_title, error_message):
        """Helper method to render error templates"""
        error_image = settings.ERROR_CODES.get(
            error_code, "assets/images/errors/default.png"
        )
        context = {
            "code": error_code,
            "title": error_title,
            "message": error_message,
            "image": error_image,
        }
        return render(
            request, "errors/http_errors.html", context, status=int(error_code)
        )
