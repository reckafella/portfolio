from django.urls import path

from app.views.views import CustomRedirectView as RedirectView
from authentication.views.auth.auth import LoginView, LogoutView, SignupView
from authentication.views.auth.sessions import ManageSessionView
from authentication.views.profile.profile import ProfileView, CitiesAPIView
from authentication.api_views import get_current_user, update_auth_state

app_name = "authentication"

urlpatterns = [
    path('profile/<str:username>', ProfileView.as_view(), name='user_profile'),
    path('api/cities/', CitiesAPIView.as_view(), name='cities_api'),
    path('api/auth/user/', get_current_user, name='current_user'),
    path('api/auth/update-state/', update_auth_state, name='update_auth_state'),
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
