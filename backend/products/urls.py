from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, precio_final # <-- Agrega precio_final aquí

router = DefaultRouter()
router.register('products', ProductViewSet, basename='products')
router.register('categories', CategoryViewSet, basename='categories')

urlpatterns = [
    path('', include(router.urls)),
]

# --- NUEVA RUTA ---
urlpatterns += [
    path('products/<int:pk>/precio-final/', precio_final),
]