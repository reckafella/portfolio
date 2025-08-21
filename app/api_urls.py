from django.urls import path, include
from rest_framework.routers import DefaultRouter

from app.views.api import contact

# DRF Router for ViewSets
router = DefaultRouter()

urlpatterns = [
    path('contact/', contact, name='contact'),
    path('', include(router.urls)),
]
