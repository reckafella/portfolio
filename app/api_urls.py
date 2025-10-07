from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.views.contact_api import ContactFormAPIView
from app.views.project_api import (
    ProjectListAPIView,
    ProjectDetailAPIView,
    ProjectCreateAPIView,
    ProjectUpdateAPIView,
    ProjectDeleteAPIView,
    ProjectViewSet,
    project_form_config
)
from app.views.views import ResumePDFView, SitemapAPIView
from app.views.api.about_view import AboutAPIView
from app.views.api.about_update_views import (
    ProfileUpdateView,
    EducationListCreateView,
    EducationDetailView,
    ExperienceListCreateView,
    ExperienceDetailView,
    SkillsListCreateView,
    SkillDetailView,
    BulkSkillsView,
    reorder_items
)
from app.views.api.captcha_views import CaptchaRefreshAPIView

# Setup DRF router for ViewSets
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    # Contact API
    path('contact/', ContactFormAPIView.as_view(), name='contact_api'),
    path("auth", include("rest_framework.urls")),
    path("auth/", include("authentication.api_urls")),

    # Blog API
    path('blog/', include('blog.api_urls')),

    # Project APIs (function-based)
    path('projects/list', ProjectListAPIView.as_view(), name='project_list_api'),
    path('projects/create/', ProjectCreateAPIView.as_view(), name='project_create_api'),
    path('projects/<slug:slug>/', ProjectDetailAPIView.as_view(), name='project_detail_api'),
    path('projects/<slug:slug>/update/', ProjectUpdateAPIView.as_view(), name='project_update_api'),
    path('projects/<slug:slug>/delete/', ProjectDeleteAPIView.as_view(), name='project_delete_api'),

    # Project form configuration
    path('projects/form-config', project_form_config, name='project_form_config'),

    # Sitemap API
    path('sitemap/', SitemapAPIView.as_view(), name='sitemap_api'),

    # About Page API (Read-only)
    path('about/', AboutAPIView.as_view(), name='about_api'),
    path('resume-pdf/', ResumePDFView.as_view(), name='resume_pdf_api'),

    # About Page Management APIs (Authenticated)
    path('about/profile/', ProfileUpdateView.as_view(), name='profile_update_api'),

    # Education APIs
    path('about/education/', EducationListCreateView.as_view(), name='education_list_create_api'),
    path('about/education/<int:education_id>/', EducationDetailView.as_view(), name='education_detail_api'),

    # Experience APIs
    path('about/experience/', ExperienceListCreateView.as_view(), name='experience_list_create_api'),
    path('about/experience/<int:experience_id>/', ExperienceDetailView.as_view(), name='experience_detail_api'),

    # Skills APIs
    path('about/skills/', SkillsListCreateView.as_view(), name='skills_list_create_api'),
    path('about/skills/<int:skill_id>/', SkillDetailView.as_view(), name='skill_detail_api'),
    path('about/skills/bulk/', BulkSkillsView.as_view(), name='bulk_skills_api'),

    # Reorder API
    path('about/reorder/', reorder_items, name='reorder_items_api'),

    # Captcha API
    path('captcha/refresh/', CaptchaRefreshAPIView.as_view(), name='captcha_refresh_api'),

    # Include router URLs (ViewSet-based)
    path('', include(router.urls)),
]
