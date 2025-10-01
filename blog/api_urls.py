from django.urls import path
from blog.views.api import api_views

app_name = 'blog_api'

urlpatterns = [
    # Blog post endpoints
    path('posts/', api_views.BlogPostListAPIView.as_view(), name='post-list'),
    path('article/create/', api_views.BlogPostCreateAPIView.as_view(), name='post-create'),
    path('article/<slug:slug>/', api_views.BlogPostDetailAPIView.as_view(), name='post-detail'),
    path('article/<slug:slug>/update/', api_views.BlogPostUpdateAPIView.as_view(), name='post-update'),
    path('article/<slug:slug>/delete/', api_views.BlogPostDeleteAPIView.as_view(), name='post-delete'),

    # Comment endpoints
    path('article/<slug:blog_slug>/comments/', api_views.BlogCommentListCreateAPIView.as_view(), name='comment-list-create'),
    path('captcha/refresh/', api_views.refresh_captcha, name='refresh-captcha'),

    # Utility endpoints
    path('stats/', api_views.blog_stats_api, name='stats'),
    path('comments/form-config/', api_views.blog_form_config, name='form-config'),
    path('post-form-config/', api_views.blog_post_form_config, name='post-form-config'),
]
