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
    path("", PostListView.as_view(), name="blog_posts_list"),
    path("/post/new", CreatePostView.as_view(), name="create_blog_post"),
    path("/post/<slug:slug>", PostDetailView.as_view(), name="blog_post_details"),
    path("/post/update/<slug:slug>", UpdatePostView.as_view(), name="update_blog_post"),
    path("/post/delete/<slug:slug>", DeletePostView.as_view(), name="delete_blog_post"),
    path("/authors/<str:username>", AuthorPostsView.as_view(), name="posts_by_author"),
]
