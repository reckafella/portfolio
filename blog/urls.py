from django.urls import path
from blog.views.create import CreatePostView
from blog.views.delete import DeletePostView
from blog.views.details import PostDetailView
from blog.views.list import (
    AuthorPostsView, PostListView,
    PostsByDateView, PostsByTopicView)
from blog.views.update import UpdatePostView

app_name = "blog"

urlpatterns = [
    path("", PostListView.as_view(), name="list_articles"),
    path("post/create", CreatePostView.as_view(), name="create_article"),
    path("post/<slug:slug>", PostDetailView.as_view(), name="article_details"),
    path("post/<slug:slug>/update", UpdatePostView.as_view(), name="update_article"),
    path("post/<slug:slug>/delete", DeletePostView.as_view(), name="delete_article"),
    path("authors/<str:username>", AuthorPostsView.as_view(), name="articles_by_author"),
    path("dates/<str:date>/", PostsByDateView.as_view(), name="articles_by_date"),
    path("topics/<str:topic>", PostsByTopicView.as_view(), name="articles_by_topic"),
]
