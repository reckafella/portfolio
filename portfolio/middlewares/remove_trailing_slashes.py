from django.http import HttpResponsePermanentRedirect
from django.utils.deprecation import MiddlewareMixin


class RemoveTrailingSlashMiddleware(MiddlewareMixin):
    def process_request(self, request):
        path: str = request.path

        # Exclude admin paths from the trailing slash logic
        if path.startswith(("/admin", "/wagtail")):
            return None

        # Ignore the root path and paths without trailing slashes
        if path != "/" and path.endswith("/"):
            # Strip the trailing slash from the path
            non_slash_path = path.rstrip("/")

            # Get the query string if it exists
            query_string = request.META.get("QUERY_STRING", "")

            # Preserve the query string if it exists
            if query_string:
                non_slash_path = f"{non_slash_path}?{query_string}"

            # Redirect to the non-slash version of the path
            return HttpResponsePermanentRedirect(non_slash_path)

        return None


""" from django.http import HttpResponsePermanentRedirect
from django.utils.deprecation import MiddlewareMixin

class RemoveTrailingSlashMiddleware(MiddlewareMixin):
    def process_request(self, request):
        path: str = request.path

        # Exclude admin paths from the trailing slash logic
        if path.startswith('/admin'):
            return None

        # Ignore the root path and paths without trailing slashes
        if path != '/' and path.endswith('/'):
            # Strip the trailing slash from the path
            non_slash_path = path.rstrip('/')
            if path.__contains__('?'):
                query_string = path.split('?')[1]

            # Preserve the query string if it exists
            if query_string:
                non_slash_path = f"{non_slash_path}?{query_string}"

            # Redirect to the non-slash version of the path
            return HttpResponsePermanentRedirect(non_slash_path)

        return None
 """
