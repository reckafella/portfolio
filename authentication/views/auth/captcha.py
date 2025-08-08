from captcha.helpers import captcha_image_url
from captcha.models import CaptchaStore
from django.http import JsonResponse
from django.views.generic import View


class CaptchaRefreshView(View):
    def get(self, request, *args, **kwargs):
        new_key = CaptchaStore.pick()
        return JsonResponse({
            'key': new_key,
            'image_url': captcha_image_url(new_key)
        })
