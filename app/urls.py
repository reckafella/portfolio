from django.urls import path
from django.views.generic import RedirectView

from .views import views, auth, search

urlpatterns = [
    path('', views.home_view, name='home'),
    path('home/', views.home_view, name='home'),
    path('accounts/login/', RedirectView.as_view(url='/login/', permanent=True)),
    path('login/', auth.login_view, name='login'),
    path('logout/', auth.logout_view, name='logout'),
    path('about/', views.about_view, name='about'),
    path('projects/', views.projects_view, name='projects'),
    path('contact/', views.contact_view, name='contact'),
    path('blog/', views.posts_list_view, name='blog'),
    path('blog/post/<slug:slug>/', views.post_detail_view, name='post_detail'),
    path('blog/authors/<str:username>/', views.author_posts_view, name='author_posts'),
    path('blog/posts/new', views.create_post, name='create_post'),
    path('search/', search.search_view, name='search'),
]
