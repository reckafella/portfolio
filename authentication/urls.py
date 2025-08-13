from django.urls import path

from app.views.views import CustomRedirectView as RedirectView
from authentication.views.auth.auth import LoginView, LogoutView, SignupView
from authentication.views.auth.sessions import ManageSessionView
from authentication.views.profile.profile import ProfileView as _PV, CitiesAPIView

app_name = "authentication"

urlpatterns = [
    path('profile/<str:username>', _PV.as_view(), name='user_profile'),
    path('api/cities/', CitiesAPIView.as_view(), name='cities_api'),
    path("accounts/register", RedirectView.as_view(redirect_to="/signup/")),
    path("accounts/signup", RedirectView.as_view(redirect_to="/signup/")),
    path("register", RedirectView.as_view(redirect_to="/signup/")),
    path("accounts/login", RedirectView.as_view(redirect_to="/login/")),
    path("accounts/logout", RedirectView.as_view(redirect_to="/logout/")),
    path("login", LoginView.as_view(), name="login"),
    path("signup", SignupView.as_view(), name="signup"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("session", ManageSessionView.as_view(), name="manage_session"),

]
