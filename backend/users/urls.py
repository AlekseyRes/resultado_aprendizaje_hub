from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MeView, RegisterView, UserViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/register/', RegisterView.as_view(), name='register'),
]
