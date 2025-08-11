"""
URL configuration for portfolio project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# ignore linting errors
# flake8: noqa

import django.contrib.auth.urls as django_auth_urls
from django.conf import settings
from django.conf.urls import handler400, handler403, handler404, handler500
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls

from app.views.views import CustomRedirectView
from authentication.views.auth.captcha import CaptchaRefreshView

# Error handling
handler404 = "authentication.views.auth.errors.handler_404"
handler500 = "authentication.views.auth.errors.handler_500"
handler403 = "authentication.views.auth.errors.handler_403"
handler400 = "authentication.views.auth.errors.handler_400"


urlpatterns = [
    path("admin/login", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    re_path("wagtail/admin/login", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    re_path("wagtail/login/", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    path("admin/", admin.site.urls),
    path("documents/", include(wagtaildocs_urls)),
    path("accounts/", include(django_auth_urls)),
    path("robots.txt", include('robots.urls')),
    re_path("wagtail/admin/", include(wagtailadmin_urls)),
    re_path("wagtail/", include(wagtail_urls)),
    path("", include("blog.urls"), name="blog"),
    path('captcha/refresh/', CaptchaRefreshView.as_view(), name='captcha-refresh'),
    path("captcha/", include("captcha.urls")),
    path("", include("app.urls"), name="app"),
    path("", include("authentication.urls"), name="auth"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
