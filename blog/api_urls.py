from django.urls import path
from . import api_views

app_name = 'blog_api'

urlpatterns = [
    # Blog post endpoints
    path('posts/', api_views.BlogPostListAPIView.as_view(), name='post-list'),
    path('posts/<slug:slug>/', api_views.BlogPostDetailAPIView.as_view(), name='post-detail'),
    path('posts/create/', api_views.BlogPostCreateAPIView.as_view(), name='post-create'),
    path('posts/<slug:slug>/update/', api_views.BlogPostUpdateAPIView.as_view(), name='post-update'),
    path('posts/<slug:slug>/delete/', api_views.BlogPostDeleteAPIView.as_view(), name='post-delete'),
    
    # Comment endpoints
    path('posts/<slug:blog_slug>/comments/', api_views.BlogCommentListCreateAPIView.as_view(), name='comment-list-create'),
    
    # Utility endpoints
    path('stats/', api_views.blog_stats_api, name='stats'),
    path('form-config/', api_views.blog_form_config, name='form-config'),
    path('post-form-config/', api_views.blog_post_form_config, name='post-form-config'),
]
