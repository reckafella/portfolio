from django.urls import path
from blog.views.posts import (
    PostListView, PostDetailView, PostCreateView,
    PostUpdateView, PostDeleteView, AuthorPostsView
)

app_name = 'blog'

urlpatterns = [
    path('', PostListView.as_view(), name='post_list'),
    path('post/new/', PostCreateView.as_view(), name='create_post'),
    path('post/<slug:slug>/', PostDetailView.as_view(), name='post_detail'),
    path('post/<slug:slug>/edit/', PostUpdateView.as_view(), name='post_edit'),
    path('post/<slug:slug>/delete/', PostDeleteView.as_view(), name='post_delete'),
    path('author/<str:username>/', AuthorPostsView.as_view(), name='author_posts'),
]