from django.urls import path
from blog.views.create import CreatePostView as CPV
from blog.views.delete import DeletePostView as DPV
from blog.views.details import PostDetailView as PDV
from blog.views.list import (
    AuthorPostsView as APV,
    PostListView as PLV,
    PostsByDateView as PBDV,
    PostsByTagView as PBTV
)
from blog.views.update import UpdatePostView as UPV

app_name = "blog"

urlpatterns = [
    path("", PLV.as_view(), name="list_articles"),
    path("article/create", CPV.as_view(), name="create_article"),
    path("article/<slug:slug>", PDV.as_view(), name="article_details"),
    path("article/<slug:slug>/update", UPV.as_view(), name="update_article"),
    path("article/<slug:slug>/delete", DPV.as_view(), name="delete_article"),
    path("authors/<str:username>", APV.as_view(), name="articles_by_author"),
    path("dates/<str:date>/", PBDV.as_view(), name="articles_by_date"),
    path("tag/<str:tag>", PBTV.as_view(), name="articles_by_tag"),
]
