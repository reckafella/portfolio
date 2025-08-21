from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.api import ContactFormAPIView, captcha_refresh

# DRF Router for ViewSets
router = DefaultRouter()

urlpatterns = [
    path('contact', ContactFormAPIView.as_view(), name='contact'),
    path('captcha/refresh', captcha_refresh, name='captcha_refresh'),
    path('', include(router.urls)),
]
