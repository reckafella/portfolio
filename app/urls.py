from django.urls import path

from app.views.views import CustomRedirectView as crv
from app.views import search, views
from app.views.auth import SignupView, LoginView, LogoutView
from app.views.profile.profile import ProfileView as PV
from app.views.sessions import SessionManagementView as SMV
from app.views.projects.create import CreateProjectView as CPV
from app.views.projects.delete import DeleteProjectView as DPV
from app.views.projects.update import UpdateProjectView as UPV
from app.views.projects.list_and_details import (
    ProjectDetailView as PDV,
    ProjectListView as PLV
)
from app.views.messages import (
    MessagesView,
    ContactSuccessView as CSV,
    ContactView,
    MarkMessageReadView as MarkAsRead
)

app_name = "app"

""" redirects """
urlpatterns = [
    path("home", crv.as_view(redirect_to="/")),
    path("accounts/register", crv.as_view(redirect_to="/signup/")),
    path("accounts/signup", crv.as_view(redirect_to="/signup/")),
    path("register", crv.as_view(redirect_to="/signup/")),
    path("accounts/login", crv.as_view(redirect_to="/login/")),
    path("accounts/logout", crv.as_view(redirect_to="/logout/")),
    path("sitemap.xml", crv.as_view(redirect_to="/sitemap/")),
]

urlpatterns += [
    path("", views.home_view, name="home"),
    path("login", LoginView.as_view(), name="login"),
    path("signup", SignupView.as_view(), name="signup"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("services", views.services, name="services"),
    path("about", views.about_view, name="about"),
    path("sitemap/", views.sitemap_view, name="sitemap"),
    path("contact", ContactView.as_view(), name="contact"),
    path("contact/success", CSV.as_view(), name="contact_success"),
    path("messages/inbox", MessagesView.as_view(), name="messages"),
    path(
        "messages/<int:message_id>/mark-read/",
        MarkAsRead.as_view(),
        name="mark_as_read"
    ),
    path("search", search.SearchView.as_view(), name="search"),
    path("resume", views.resume_view, name="resume"),
    path("resume-pdf", views.resume_pdf_view, name="resume_pdf"),
    path("session", SMV.as_view(), name="manage_session"),
]

urlpatterns += [
    path("projects", PLV.as_view(), name="projects"),
    path("projects/new", CPV.as_view(), name="add_project"),
    path("projects/<slug:slug>", PDV.as_view(), name="project_detail"),
    path("projects/<slug:slug>/update", UPV.as_view(), name="update_project"),
    path("projects/<slug:slug>/delete", DPV.as_view(), name="delete_project"),
]

urlpatterns += [
    path('profile/<str:username>', PV.as_view(), name='profile_detail'),
]
