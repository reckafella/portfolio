from django.http import HttpRequest
import requests
from django.conf import settings


def upload_image_to_cloudflare(image):
    url = "https://api.cloudflare.com/client/v4/accounts/{}/images/v1".format(settings.CLOUDFLARE_ACCOUNT_ID)
    headers = {
        "Authorization": f"Bearer {settings.CLOUDFLARE_API_TOKEN}",
    }
    files = {
        'file': (image.name, image.read(), image.content_type)
    }
    response = requests.post(url, headers=headers, files=files)
    response_data = response.json()
    
    if response_data.get("success"):
        image_id = response_data["result"]["id"]
        image_url = response_data["result"]["variants"][0]
        return image_id, image_url
    else:
        raise Exception("Failed to upload image to Cloudflare")


def delete_image_from_cloudflare(image_id):
    url = f"https://api.cloudflare.com/client/v4/accounts/{settings.CLOUDFLARE_ACCOUNT_ID}/images/v1/{image_id}"
    headers = {
        "Authorization": f"Bearer {settings.CLOUDFLARE_API_TOKEN}",
    }
    response = requests.delete(url, headers=headers)
    response_data = response.json()
    return response_data.get("success", False)


def is_ajax(request: HttpRequest) -> bool:
    '''
    Checks whether the request received is from Ajax. Returns a boolean value.
    '''
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'
