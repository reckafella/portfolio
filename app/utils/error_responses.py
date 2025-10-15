"""
Standardized error response utilities for consistent API error handling
"""

from rest_framework.response import Response
from rest_framework import status as http_status


def error_response(
    message: str,
    error_type: str = 'validation',
    code: str | None = None,
    details: dict | None = None,
    status_code: int = http_status.HTTP_400_BAD_REQUEST
) -> Response:
    """
    Return standardized error response for frontend toast notifications

    Args:
        message: User-friendly error message
        error_type: Type of error (validation, server, cloudinary, auth, etc.)
        code: Optional error code for specific handling
        details: Optional technical details for debugging
        status_code: HTTP status code (default 400)

    Returns:
        Response: DRF Response object with standardized error format

    Response format:
    {
        'success': False,
        'error': {
            'type': 'validation',
            'message': 'User-friendly message',
            'code': 'ERROR_CODE',  # Optional
            'details': {...}  # Optional technical details
        }
    }
    """
    error_data = {
        'success': False,
        'error': {
            'type': error_type,
            'message': message
        }
    }

    if code:
        error_data['error']['code'] = code

    if details:
        error_data['error']['details'] = details

    return Response(error_data, status=status_code)


def success_response(
    message: str,
    data: dict | None = None,
    status_code: int = http_status.HTTP_200_OK
) -> Response:
    """
    Return standardized success response

    Args:
        message: Success message
        data: Optional response data
        status_code: HTTP status code (default 200)

    Returns:
        Response: DRF Response object with standardized success format
    """
    response_data = {
        'success': True,
        'message': message
    }

    if data:
        response_data['data'] = data

    return Response(response_data, status=status_code)


def cloudinary_error_response(
    message: str = "Failed to process image. Please try again.",
    details: str | None = None
) -> Response:
    """
    Return standardized Cloudinary error response

    Args:
        message: User-friendly error message
        details: Technical error details

    Returns:
        Response: DRF Response object with Cloudinary error
    """
    return error_response(
        message=message,
        error_type='cloudinary',
        code='CLOUDINARY_ERROR',
        details={'error': details} if details else None,
        status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def validation_error_response(
    message: str,
    field_errors: dict | None = None
) -> Response:
    """
    Return standardized validation error response

    Args:
        message: User-friendly error message
        field_errors: Dictionary of field-specific errors

    Returns:
        Response: DRF Response object with validation error
    """
    return error_response(
        message=message,
        error_type='validation',
        code='VALIDATION_ERROR',
        details=field_errors,
        status_code=http_status.HTTP_400_BAD_REQUEST
    )
