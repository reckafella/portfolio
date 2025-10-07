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
from app.views.base_api import FrontendAPIView
from app.views.views import AppHealthCheckView as app_is_running

# Error handling
handler404 = "app.views.error_views.custom_404"
handler500 = "app.views.error_views.custom_500"
handler403 = "app.views.error_views.custom_403"
handler400 = "app.views.error_views.custom_400"


urlpatterns = [
    path("admin/login", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    re_path("wagtail/admin/login", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    re_path("wagtail/login/", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    path("admin/", admin.site.urls),
    path("documents/", include(wagtaildocs_urls)),
    path("accounts/", include(django_auth_urls)),
    path("robots.txt", include('robots.urls')),
    path("wagtail/admin/", include(wagtailadmin_urls)),
    path("app-running", app_is_running.as_view(), name="app_is_running"),
    path("wagtail/", include(wagtail_urls)),

    # API endpoints
    path("api/v1/", include("app.api_urls")),

    # React frontend assets (catch specific asset paths first)
    re_path(r"^assets/(?P<path>.*)$", FrontendAPIView.as_view(), name="react_assets"),
    re_path(r"^favicon\.(svg|ico)$", FrontendAPIView.as_view(), name="react_favicon"),

    # Regular app URLs - ordered from most specific to least specific
    path('captcha/refresh/', CaptchaRefreshView.as_view(), name='captcha-refresh'),
    path("captcha/", include("captcha.urls")),
    path("blog/", include("blog.urls"), name="blog"),
    path("auth/", include("authentication.urls"), name="auth"),
    path("app/", include("app.urls"), name="app"),

    # React frontend (catch-all for React Router) - must be last
    re_path(r"^.*$", FrontendAPIView.as_view(), name="react_frontend")
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
