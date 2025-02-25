from django.urls import path
from blog.views.create import CreatePostView
from blog.views.delete import DeletePostView
from blog.views.details import PostDetailView
from blog.views.list import (
    AuthorPostsView, PostListView,
    PostsByDateView, TopicPostsView)
from blog.views.update import UpdatePostView

app_name = "blog"

urlpatterns = [
    path("", PostListView.as_view(), name="blog_posts_list"),
    path("post/create", CreatePostView.as_view(), name="create_blog_post"),
    path("post/<slug:slug>", PostDetailView.as_view(), name="blog_post_details"),
    path("post/<slug:slug>/update", UpdatePostView.as_view(), name="update_blog_post"),
    path("post/<slug:slug>/delete", DeletePostView.as_view(), name="delete_blog_post"),
    path("authors/<str:username>", AuthorPostsView.as_view(), name="posts_by_author"),
    path("dates/<str:date>/", PostsByDateView.as_view(), name="posts_by_date"),
    path("topics/<str:topic>", TopicPostsView.as_view(), name="posts_by_topic"),
]
