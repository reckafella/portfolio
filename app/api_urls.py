from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.contact_api import ContactFormAPIView
from .views.project_api import (
    ProjectListAPIView,
    ProjectDetailAPIView,
    ProjectCreateAPIView,
    ProjectUpdateAPIView,
    ProjectDeleteAPIView,
    ProjectViewSet,
    project_form_config
)

# Setup DRF router for ViewSets
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    # Contact API
    path('contact', ContactFormAPIView.as_view(), name='contact_api'),
    path("auth", include("rest_framework.urls")),
    path("auth/", include("authentication.api_urls")),

    # Blog API
    path('blog/', include('blog.api_urls')),

    # Project APIs (function-based)
    path('projects/list', ProjectListAPIView.as_view(), name='project_list_api'),
    path('projects/create', ProjectCreateAPIView.as_view(), name='project_create_api'),
    path('projects/<int:pk>', ProjectDetailAPIView.as_view(), name='project_detail_api'),
    path('projects/<int:pk>/update', ProjectUpdateAPIView.as_view(), name='project_update_api'),
    path('projects/<int:pk>/delete', ProjectDeleteAPIView.as_view(), name='project_delete_api'),

    # Project form configuration
    path('projects/form-config', project_form_config, name='project_form_config'),

    # Include router URLs (ViewSet-based)
    path('', include(router.urls)),
]
