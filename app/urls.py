from django.urls import path
from django.views.generic import RedirectView

from app.views import views, auth, search, projects, posts, messages


urlpatterns = [
    path('', views.home_view, name='home'),
    path('home/', views.home_view, name='home'),
    path('accounts/login/', RedirectView.as_view(url='/login/', permanent=True)),
    path('login/', auth.login_view, name='login'),
    path('accounts/register/', RedirectView.as_view(url='/signup/', permanent=True)),
    path('accounts/signup/', RedirectView.as_view(url='/signup/', permanent=True)),
    path('register/', RedirectView.as_view(url='/signup/', permanent=True)),
    path('signup/', auth.signup_view, name='signup'),
    path('logout/', auth.logout_view, name='logout'),
    path('about/', views.about_view, name='about'),
    path('projects/', projects.projects_view, name='projects'),
    path('projects/add/', projects.add_project_view, name='add_project'),
    path('contact/', views.contact_view, name='contact'),
    path('blog/', posts.posts_list_view, name='blog'),
    path('blog/post/<slug:slug>/', posts.post_detail_view, name='post_detail'),
    path('blog/authors/<str:username>/', posts.author_posts_view, name='author_posts'),
    path('blog/posts/new', posts.create_post, name='create_post'),
    path('search/', search.search_view, name='search'),
    path('resume/', views.resume_pdf_view, name='resume'),
    path('resume-pdf/', views.resume_pdf_view, name='resume_pdf'),
    path('messages/', messages.view_messages, name='messages'),
]

