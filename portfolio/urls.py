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
    re_path("wagtail/admin/", include(wagtailadmin_urls)),
    re_path("wagtail/", include(wagtail_urls)),
    
    # API endpoints
    path("api/v1/auth", include("rest_framework.urls")),
    path("api/v1/auth/", include("authentication.api_urls")),
    # path("api/v1/blog/", include("blog.api_urls")),
    path("api/v1/", include("app.api_urls")),
    # path("api/v1/", include("app.api_urls")),  # We'll create this next
    
    # Regular app URLs
    path("", include("blog.urls"), name="blog"),
    path('captcha/refresh/', CaptchaRefreshView.as_view(), name='captcha-refresh'),
    path("captcha/", include("captcha.urls")),
    path("", include("app.urls"), name="app"),
    path("", include("authentication.urls"), name="auth"),
]

# Add error test routes for development
if settings.DEBUG:
    from app.views.error_views import custom_400, custom_403, custom_404, custom_500
    urlpatterns += [
        path('test/400/', lambda request: custom_400(request), name='test_400'),
        path('test/403/', lambda request: custom_403(request), name='test_403'),
        path('test/404/', lambda request: custom_404(request), name='test_404'),
        path('test/500/', lambda request: custom_500(request), name='test_500'),
    ]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
