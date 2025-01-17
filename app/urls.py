from django.urls import path
from django.contrib.sitemaps.views import sitemap

from app.views.views import CustomRedirectView
from app.views.sitemap import BlogPostSitemap, ProjectsSitemap, WagtailSitemap
from app.views import search, views
from app.views.auth import SignupView, LoginView, LogoutView
from app.views.messages import MessagesView, ContactSuccessView, ContactView
from app.views.projects.create import CreateProjectView
from app.views.projects.delete import DeleteProjectView
from app.views.projects.list_and_details import ProjectDetailView, ProjectListView
from app.views.projects.update import UpdateProjectView
from app.views.sessions import check_session, update_session


app_name = "app"

urlpatterns = [
    path("home", CustomRedirectView.as_view(redirect_to="/", permanent=True)),
    path("accounts/register", CustomRedirectView.as_view(redirect_to="/signup/", permanent=True)),
    path("accounts/signup", CustomRedirectView.as_view(redirect_to="/signup/", permanent=True)),
    path("register", CustomRedirectView.as_view(redirect_to="/signup/", permanent=True)),
    path("accounts/login", CustomRedirectView.as_view(redirect_to="/login/", permanent=True)),
    path("accounts/logout", CustomRedirectView.as_view(redirect_to="/logout/", permanent=True)),
    path("", views.home_view, name="home"),
    path("login", LoginView.as_view(), name="login"),
    path("signup", SignupView.as_view(), name="signup"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("about", views.about_view, name="about"),
    path('sitemap/', views.sitemap_view, name='html_sitemap'),
    path("projects", ProjectListView.as_view(), name="projects"),
    path("projects/new", CreateProjectView.as_view(), name="add_project"),
    path("projects/<slug:slug>", ProjectDetailView.as_view(), name="project_detail"),
    path(
        "projects/<slug:slug>/update", UpdateProjectView.as_view(), name="update_project"
    ),
    path(
        "projects/<slug:slug>/delete", DeleteProjectView.as_view(), name="delete_project"
    ),
    path("contact", ContactView.as_view(), name="contact"),
    path("contact/success", ContactSuccessView.as_view(), name="contact_success"),
    path("messages", MessagesView.as_view(), name="messages"),
    path("search/", search.search_view, name="search"),
    path("resume", views.resume_pdf_view, name="resume"),
    path("resume-pdf", views.resume_pdf_view, name="resume_pdf"),
]


sitemaps = {
    'blog_posts': BlogPostSitemap,
    'projects': ProjectsSitemap,
    'pages': WagtailSitemap,
}

urlpatterns += [
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    path('session/check', check_session, name='check_session'),
    path('session/update', update_session, name='update_session'),
]
