
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CartItemViewSet, WishlistViewSet
app_name = 'cart'
router = DefaultRouter()

# CartItemViewSet регистрируем для работы с конкретными айтемами
# URL: /api/cart-items/ (POST, GET)
# URL: /api/cart-items/5/ (DELETE, PATCH)
router.register(r'cart-items', CartItemViewSet, basename='cart-item')

router.register(r'wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('cart/', CartViewSet.as_view({'get': 'list'}), name='cart-detail'),
    path('', include(router.urls)),
]