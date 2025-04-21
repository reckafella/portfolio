import os
import json
from typing import Tuple
from django.conf import settings
from django.http import HttpRequest, JsonResponse
from django.core.exceptions import PermissionDenied


def is_ajax(request: HttpRequest) -> bool:
    """
    Checks whether the request received is from Ajax.
    * Returns a boolean value.
    """
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


def get_cloudinary_creds() -> Tuple[str, str, str]:
    """
    Get the Cloudinary Cloud Name, API Key,
        and API Secret from cloudinary.json
        located at the root of the project.
    """
    file_path = os.path.join(settings.BASE_DIR, "cloudinary.json")

    try:
        with open(file_path, "r") as fl:
            data = json.load(fl)
            cloud_name: str = data.get("CLOUDINARY_CLOUD_NAME", "")
            api_key: str = data.get("CLOUDINARY_API_KEY", "")
            api_secret: str = data.get("CLOUDINARY_API_SECRET", "")
    except FileNotFoundError:
        raise FileNotFoundError("cloudinary.json file not found")

    return cloud_name, api_key, api_secret


def get_error_files() -> Tuple[str, str, str, str]:
    """
    Returns the urls for the images used in error pages. 
    * file named: error-files.json
    """
    file_path = os.path.join(
        settings.BASE_DIR, "app", "static",
        "assets", "data", "error-imgs.json"
    )

    try:
        with open(file_path, "r") as fl:
            data = json.load(fl)
            error_404: str = data.get("error_404", "")
            error_500: str = data.get("error_500", "")
            error_403: str = data.get("error_403", "")
            error_400: str = data.get("error_400", "")
    except FileNotFoundError:
        raise FileNotFoundError("error-files.json file not found")

    return error_400, error_403, error_404, error_500


def handle_no_permissions(request: HttpRequest, exception: str) -> None:
    """
    Handle cases when a user does not have permission to access a page.
    """
    if is_ajax(request):
        return JsonResponse({
            "success": False,
            "errors": str(exception)},
            status=403
        )
    raise PermissionDenied(str(exception))


def return_response(
    request: HttpRequest, response: dict, status_code: int
) -> JsonResponse:
    """
    Return a JsonResponse based on the request type.
    """
    if is_ajax(request):
        return JsonResponse(response, status=status_code)
    return JsonResponse(response, status=status_code)


def guess_file_type(file) -> str:
    """
    Guess the image type from the image content using the filetype module.
    """
    try:
        import filetype
        file.seek(0)
        file_type = filetype.guess(file.read())
        file.seek(0)
        return file_type.mime if file_type else None
    except Exception:
        return None
