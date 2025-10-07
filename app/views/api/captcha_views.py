from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.core.cache import cache
from django.views import View
from django.utils.translation import gettext as _
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url


class CaptchaRefreshAPIView(View):
    """
    API view for refreshing captcha images.
    Handles both generating new captchas and cleaning up old ones.
    """
    def get(self, request, *args, **kwargs):
        old_key = request.GET.get('old_key')

        # Clean up old captcha if provided
        if old_key:
            try:
                old_captcha = CaptchaStore.objects.filter(hashkey=old_key).first()
                if old_captcha:
                    old_captcha.delete()
            except Exception as e:
                print(f"Error cleaning up old captcha: {e}")

        # Generate new captcha
        new_key = CaptchaStore.generate_key()
        store = CaptchaStore.objects.get(hashkey=new_key)

        # Get the image URL for the new captcha
        image_url = captcha_image_url(new_key)

        # Rate limiting for non-authenticated users
        if isinstance(request.user, AnonymousUser):
            ip_address = request.META.get('REMOTE_ADDR', '')
            cache_key = f'captcha_refresh_rate_{ip_address}'
            refresh_count = cache.get(cache_key, 0)

            if refresh_count > 10:  # Max 10 refreshes per minute
                return JsonResponse({
                    'error': _('Too many captcha refresh attempts. Please wait a minute.')
                }, status=429)

            cache.set(cache_key, refresh_count + 1, 60)  # 1 minute expiry

        return JsonResponse({
            'captcha_key': new_key,
            'captcha_image': request.build_absolute_uri(image_url)
        })
