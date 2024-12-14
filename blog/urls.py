from django.urls import path
from blog.views.create import CreatePostView
from blog.views.delete import DeletePostView
from blog.views.details import PostDetailView
from blog.views.list import AuthorPostsView, PostListView
from blog.views.update import UpdatePostView

app_name = "blog"

urlpatterns = [
    path("", PostListView.as_view(), name="post_list"),
    path("post/new", CreatePostView.as_view(), name="create_post"),
    path("post/<slug:slug>", PostDetailView.as_view(), name="post_detail"),
    path("post/update/<slug:slug>", UpdatePostView.as_view(), name="update_post"),
    path("post/delete/<slug:slug>", DeletePostView.as_view(), name="delete_post"),
    path("authors/<str:username>", AuthorPostsView.as_view(), name="author_posts"),
]
