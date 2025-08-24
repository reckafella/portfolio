from django.urls import path
from django.views.generic import TemplateView

from .views import search
from .views.messages import ContactSuccessView as CSV
from .views.messages import ContactView
from .views.messages import ContactFormConfigView
from .views.messages import MarkMessageReadView as MarkAsRead
from .views.messages import MessageDetailView as MessageDetail
from .views.messages import DeleteMessageView as DeleteMessage
from .views.messages import BulkMessageActionsView as BulkActions
from .views.messages import MessagesView
from .views.projects.create import CreateProjectView as CPV
from .views.projects.delete import DeleteProjectView as DPV
from .views.projects.details import ProjectDetailView as PDV
from .views.projects.list import ProjectListView as PLV
from .views.projects.update import UpdateProjectView as UPV
from .views.views import AboutView
from .views.views import CustomRedirectView as crv
from .views.views import (HomeView, ResumePDFView, ServicesView,
                          SitemapView, render_favicon)

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
    path("contact/form-config", ContactFormConfigView.as_view(), name="contact_form_config"),
    path("contact/success", CSV.as_view(), name="contact_success"),
    path("messages/inbox", MessagesView.as_view(), name="messages"),
    path("messages/<int:message_id>/", MessageDetail.as_view(), name="message_detail"),
    path("messages/<int:message_id>/mark-read/", MarkAsRead.as_view(), name="mark_as_read"),
    path("messages/<int:message_id>/delete/", DeleteMessage.as_view(), name="delete_message"),
    path("messages/bulk-actions/", BulkActions.as_view(), name="bulk_message_actions"),
    path("session-test", TemplateView.as_view(template_name="app/session_test.html"), name="session_test"),
    path("favicon.ico", render_favicon, name="favicon"),
    path("search/<path:invalid_path>", crv.as_view(redirect_to="/search")),
    path("projects/<path:invalid_path>", crv.as_view(redirect_to="/projects")),
    path("contact/<path:invalid_path>", crv.as_view(redirect_to="/contact"))
]
