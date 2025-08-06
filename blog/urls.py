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

# from blog.views.increment_views import IncrementViewCountView as IVV
from blog.views.update import UpdatePostView as UPV
from app.views.views import CustomRedirectView as CRV

app_name = "blog"

urlpatterns = [
    path("blog", PLV.as_view(), name="list_articles"),
    path("blog/article/", CRV.as_view(redirect_to="/blog")),
    path("blog/article/create", CPV.as_view(), name="create_article"),
    path("blog/article/<slug:slug>", PDV.as_view(), name="article_details"),
    path("blog/article/<slug:slug>/update", UPV.as_view(),
         name="update_article"),
    path("blog/article/<slug:slug>/delete", DPV.as_view(),
         name="delete_article"),
    path("blog/authors/<str:username>", APV.as_view(),
         name="articles_by_author"),
    path("blog/dates/<str:date>/", PBDV.as_view(), name="articles_by_date"),
    path("blog/tag/<str:tag>", PBTV.as_view(), name="articles_by_tag"),
    path("blog/<path:invalid_path>", CRV.as_view(redirect_to="/blog"))
]
