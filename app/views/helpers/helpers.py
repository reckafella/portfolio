import os
import json
import requests
from typing import Tuple
from django.conf import settings
from django.http import HttpRequest


class CloudflareImagesUploadandDelete:
    """
    Class to handle Cloudflare Image Upload and Delete operations.
    """
    def __init__(self, account_id: str, api_token: str) -> None:
        self.account_id = account_id
        self.api_token = api_token
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/images/v1"

    def upload_image(self, image, metadata=None) -> dict:
        """
        Upload an image to Cloudflare and return the result.
        """
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": image.content_type,
        }
        files = {
            'file': (image.name, image.read(), image.content_type)
        }
        if metadata:
            files.update({
                'metadata': (None, metadata, 'application/json')
            })
        response = requests.post(
            self.base_url,
            headers=headers,
            files=files
        )
        return self._handle_response(response, operation="upload")

    def delete_image(self, image_id: str) -> dict:
        """
        Delete an image from Cloudflare and return the result.
        """
        url = f"{self.base_url}/{image_id}"
        headers = {
            "Authorization": f"Bearer {self.api_token}",
        }
        response = requests.delete(url, headers=headers)
        return self._handle_response(response, operation="delete")

    def _handle_response(self, response: requests.Response, operation: str) -> dict:
        """
        Handle the response from the Cloudflare API and return the result if successful.
        """
        response_data = response.json()
        if response_data.get("success", False):
            if operation == "upload":
                image_id = response_data["result"]["id"]
                image_url = response_data["result"]["variants"][0]
                return image_id, image_url
            return response_data
        else:
            errors = response_data.get("errors", [])
            error_messages = [error.get("message", "Unknown Error") for error in errors]

            if operation == "upload":
                raise Exception(f"Upload Failed: {', '.join(error_messages)}")
            elif operation == "delete":
                raise Exception(f"Deletion Failed: {', '.join(error_messages)}")
        return response_data

    def __str__(self) -> str:
        return "Class to handle Cloudflare Image Upload and Delete operations"


def is_ajax(request: HttpRequest) -> bool:
    '''
    Checks whether the request received is from Ajax. Returns a boolean value.
    '''
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'


def get_cloudflare_id_and_token() -> Tuple[str, str]:
    '''
    Get the Cloudflare Account ID and API Token from cloudflare.json located at the root of the project.
    '''
    file_path = os.path.join(settings.BASE_DIR, 'cloudflare.json')
    with open(file_path, 'r') as fl:
        data = json.load(fl)
        account_id = data.get('CLOUDFLARE_ACCOUNT_ID', '')
        api_token = data.get('CLOUDFLARE_API_TOKEN', '')
    return account_id, api_token

def get_cloudinary_id_and_secret() -> Tuple[str, str, str]:
    '''
    Get the Cloudinary Cloud Name, API Key, and API Secret from cloudinary.json located at the root of the project.
    '''
    file_path = os.path.join(settings.BASE_DIR, 'cloudinary.json')
    with open(file_path, 'r') as fl:
        data = json.load(fl)
        cloud_name: str = data.get('CLOUDINARY_CLOUD_NAME', '')
        api_key: str = data.get('CLOUDINARY_API_KEY', '')
        api_secret: str = data.get('CLOUDINARY_API_SECRET', '')
    return cloud_name, api_key, api_secret
