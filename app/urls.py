from django.urls import path
from django.views.generic import RedirectView

from app.views import views, auth, search, projects, messages

app_name = 'app'

urlpatterns = [
    path('home/', RedirectView.as_view(url='/', permanent=True)),
    path('accounts/register/', RedirectView.as_view(url='/signup/', permanent=True)),
    path('accounts/signup/', RedirectView.as_view(url='/signup/', permanent=True)),
    path('register/', RedirectView.as_view(url='/signup/', permanent=True)),
    path('accounts/login/', RedirectView.as_view(url='/login/', permanent=True)),
    path('accounts/logout/', RedirectView.as_view(url='/logout/', permanent=True)),

    path('', views.home_view, name='home'),
    path('login/', auth.login_view, name='login'),
    path('signup/', auth.signup_view, name='signup'),
    path('logout/', auth.logout_view, name='logout'),
    path('about/', views.about_view, name='about'),
    path('projects/', projects.projects_view, name='projects'),
    path('projects/add/', projects.add_project_view, name='add_project'),
    path('contact/', views.contact_view, name='contact'),
    path('search/', search.search_view, name='search'),
    path('resume/', views.resume_pdf_view, name='resume'),
    path('resume-pdf/', views.resume_pdf_view, name='resume_pdf'),
    path('messages/', messages.view_messages, name='messages'),
]

