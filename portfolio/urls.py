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

from django.conf.urls import handler400, handler403, handler404, handler500
from django.contrib import admin
import django.contrib.auth.urls as django_auth_urls
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from app.views.views import CustomRedirectView

# Error handling
handler404 = "app.views.errors.error_404_view"
handler500 = "app.views.errors.error_500_view"
handler403 = "app.views.errors.error_403_view"
handler400 = "app.views.errors.error_400_view"


urlpatterns = [
    path("admin/", admin.site.urls),
    path("cms/admin/login", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    path("cms/admin/", include(wagtailadmin_urls)),
    path("cms/login/", CustomRedirectView.as_view(redirect_to="/login", permanent=True)),
    path("documents/", include(wagtaildocs_urls)),
    path("accounts/", include("django_auth_urls")),
    path('robots.txt', include('robots.urls')),
    path("cms/", include(wagtail_urls)),
    path("blog/", include("blog.urls"), name="blog"),
    path("", include("app.urls"), name="app"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)