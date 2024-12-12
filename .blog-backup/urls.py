from django.urls import path

from blog.views.posts import (
    AuthorPostsView,
    CreatePostView,
    DeletePostView,
    PostDetailView,
    PostListView,
    UpdatePostView,
)

app_name = "blog"

urlpatterns = [
    path("", PostListView.as_view(), name="post_list"),
    path("/post/new", CreatePostView.as_view(), name="create_post"),
    path("/post/<slug:slug>", PostDetailView.as_view(), name="post_detail"),
    path("/post/update/<slug:slug>", UpdatePostView.as_view(), name="update_post"),
    path("/post/delete/<slug:slug>", DeletePostView.as_view(), name="delete_post"),
    path("/authors/<str:username>", AuthorPostsView.as_view(), name="author_posts"),
]
