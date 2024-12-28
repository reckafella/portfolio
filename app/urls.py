from django.urls import path
from django.contrib.sitemaps.views import sitemap

from app.views.views import CustomRedirectView
from app.views.sitemap import BlogPostSitemap, ProjectsSitemap, WagtailSitemap
from app.views import auth, messages, search, views
from app.views.projects.create import CreateProjectView
from app.views.projects.delete import DeleteProjectView
from app.views.projects.list_and_details import ProjectDetailView, ProjectListView
from app.views.projects.update import UpdateProjectView

app_name = "app"

urlpatterns = [
    path("home", CustomRedirectView.as_view(redirect_to="/", permanent=True)),
    path("accounts/register", CustomRedirectView.as_view(redirect_to="/signup/", permanent=True)),
    path("accounts/signup", CustomRedirectView.as_view(redirect_to="/signup/", permanent=True)),
    path("register", CustomRedirectView.as_view(redirect_to="/signup/", permanent=True)),
    path("accounts/login", CustomRedirectView.as_view(redirect_to="/login/", permanent=True)),
    path("accounts/logout", CustomRedirectView.as_view(redirect_to="/logout/", permanent=True)),
    path("", views.home_view, name="home"),
    path("login", auth.login_view, name="login"),
    path("signup", auth.signup_view, name="signup"),
    path("logout", auth.logout_view, name="logout"),
    path("about", views.about_view, name="about"),
    path('sitemap/', views.sitemap_view, name='html_sitemap'),
    path("projects", ProjectListView.as_view(), name="projects"),
    path("projects/new", CreateProjectView.as_view(), name="add_project"),
    path("projects/<slug:slug>", ProjectDetailView.as_view(), name="project_detail"),
    path(
        "projects/update/<slug:slug>", UpdateProjectView.as_view(), name="update_project"
    ),
    path(
        "projects/delete/<slug:slug>", DeleteProjectView.as_view(), name="delete_project"
    ),
    path("contact", messages.contact_view, name="contact"),
    path("contact/success", messages.contact_success_view, name="contact_success"),
    path("search/", search.search_view, name="search"),
    path("resume", views.resume_pdf_view, name="resume"),
    path("resume-pdf", views.resume_pdf_view, name="resume_pdf"),
    path("messages", messages.view_messages, name="messages"),
]


sitemaps = {
    'blog_posts': BlogPostSitemap,
    'projects': ProjectsSitemap,
    'pages': WagtailSitemap,
}

urlpatterns += [
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
]
