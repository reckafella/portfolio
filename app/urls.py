from django.urls import path

from app.views import search
from app.views.views import (
    HomeView,
    AboutView,
    ServicesView,
    ResumePDFView,
    SitemapView,
    CustomRedirectView as crv,
    AppHealthCheckView as app_is_running,
    render_favicon
)
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
    path("sitemap.xml", crv.as_view(redirect_to="/sitemap/")),
    path("projects", PLV.as_view(), name="projects"),
    path("projects/new", CPV.as_view(), name="add_project"),
    path("projects/<slug:slug>", PDV.as_view(), name="project_details"),
    path("projects/<slug:slug>/update", UPV.as_view(), name="update_project"),
    path("projects/<slug:slug>/delete", DPV.as_view(), name="delete_project"),
    path("", HomeView.as_view(), name="home"),
    path("services", ServicesView.as_view(), name="services"),
    path("about", AboutView.as_view(), name="about"),
    path("sitemap/", SitemapView.as_view(), name="sitemap"),
    path("search", search.SearchView.as_view(), name="search"),
    path("resume", crv.as_view(redirect_to="/about"), name="resume"),
    path("resume-pdf", ResumePDFView.as_view(), name="resume_pdf"),
    path("contact", ContactView.as_view(), name="contact"),
    path("contact/success", CSV.as_view(), name="contact_success"),
    path("messages/inbox", MessagesView.as_view(), name="messages"),
    path(
        "messages/<int:message_id>/mark-read/",
        MarkAsRead.as_view(),
        name="mark_as_read"
    ),
    path("app-running", app_is_running.as_view(), name="app_is_running"),
    path("favicon.ico", render_favicon, name="favicon"),
]
