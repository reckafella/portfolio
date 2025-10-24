from django.urls import path
from blog.api.views import views

app_name = 'blog_api'

urlpatterns = [
    # Blog post endpoints
    path('posts/', views.BlogPostListAPIView.as_view(), name='post-list'),
    path('article/create/', views.BlogPostCreateAPIView.as_view(), name='post-create'),
    path('article/<slug:slug>/', views.BlogPostDetailAPIView.as_view(), name='post-detail'),
    path('article/<slug:slug>/update/', views.BlogPostUpdateAPIView.as_view(), name='post-update'),
    path('article/<slug:slug>/delete/', views.BlogPostDeleteAPIView.as_view(), name='post-delete'),

    # Comment endpoints
    path('article/<slug:blog_slug>/comments/', views.BlogCommentListCreateAPIView.as_view(), name='comment-list-create'),
    path('captcha/refresh/', views.refresh_captcha, name='refresh-captcha'),

    # Utility endpoints
    path('stats/', views.blog_stats_api, name='stats'),
    path('comments/form-config/', views.blog_form_config, name='form-config'),
    path('post-form-config/', views.blog_post_form_config, name='post-form-config'),
]
