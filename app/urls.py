from django.urls import path

from app.views.views import CustomRedirectView as crv
from app.views import search, views
from app.views.auth import SignupView, LoginView, LogoutView
from app.views.messages import (
    MessagesView,
    ContactSuccessView as csv,
    ContactView,
    MarkMessageReadView
)
from app.views.projects.create import CreateProjectView as cpv
from app.views.projects.delete import DeleteProjectView as dpv
from app.views.projects.list_and_details import (
    ProjectDetailView as pdv,
    ProjectListView as plv
)
from app.views.projects.update import UpdateProjectView as upv
from app.views.profile.profile import ProfileView

from app.views.sessions import check_session, update_session


app_name = "app"

""" redirects """
urlpatterns = [
    path("home", crv.as_view(redirect_to="/")),
    path("accounts/register", crv.as_view(redirect_to="/signup/")),
    path("accounts/signup", crv.as_view(redirect_to="/signup/")),
    path("register", crv.as_view(redirect_to="/signup/")),
    path("accounts/login", crv.as_view(redirect_to="/login/")),
    path("accounts/logout", crv.as_view(redirect_to="/logout/")),
    path("sitemap.xml", crv.as_view(redirect_to="/sitemap")),
]

urlpatterns += [
    path("", views.home_view, name="home"),
    path("login", LoginView.as_view(), name="login"),
    path("signup", SignupView.as_view(), name="signup"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("about", views.about_view, name="about"),
    path("sitemap", views.sitemap_view, name="sitemap"),
    path("contact", ContactView.as_view(), name="contact"),
    path("services", views.services, name="services"),
    path("contact/success", csv.as_view(), name="contact_success"),
    path("messages", MessagesView.as_view(), name="messages"),
    path("messages/<int:message_id>/mark-read/", MarkMessageReadView.as_view(), name="mark_message_read"),
    path("search", search.search_view, name="search"),
    path("resume", views.resume_view, name="resume"),
    path("resume-pdf", views.resume_pdf_view, name="resume_pdf"),
    path("session/check", check_session, name="check_session"),
    path("session/update", update_session, name="update_session"),
]

urlpatterns += [
    path("projects", plv.as_view(), name="projects"),
    path("projects/new", cpv.as_view(), name="add_project"),
    path("projects/<slug:slug>", pdv.as_view(), name="project_detail"),
    path("projects/<slug:slug>/update", upv.as_view(), name="update_project"),
    path("projects/<slug:slug>/delete", dpv.as_view(), name="delete_project"),
]

urlpatterns += [
    path('profile/<str:username>', ProfileView.as_view(), name='profile_detail'),
]
