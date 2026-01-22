from rest_framework import viewsets, status, mixins
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Wishlist, Product
from .serializers import CartSerializer, CartItemSerializer, WishlistSerializer

class CartMixin:
    """Утилита для получения текущей корзины пользователя или анонима"""
    def get_cart(self, request):
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
        else:
            # Для анонимов используем session_key
            if not request.session.session_key:
                request.session.create()
            cart, created = Cart.objects.get_or_create(
                session_key=request.session.session_key, 
                user=None
            )
        return cart

class CartViewSet(CartMixin, viewsets.ViewSet):
    """
    ViewSet для получения всей корзины целиком (GET /api/cart/)
    """
    permission_classes = [AllowAny]

    def list(self, request):
        cart = self.get_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

class CartItemViewSet(CartMixin, viewsets.ModelViewSet):
    """
    CRUD для позиций внутри корзины.
    POST: Добавить товар
    PATCH: Изменить количество
    DELETE: Удалить товар
    """
    serializer_class = CartItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Возвращаем только items текущей корзины
        cart = self.get_cart(self.request)
        return CartItem.objects.filter(cart=cart)

    def perform_create(self, serializer):
        cart = self.get_cart(self.request)
        product = serializer.validated_data['product']
        
        # Проверка: если товар уже есть в корзине, просто увеличиваем количество
        # Вместо создания новой строки CartItem
        existing_item = CartItem.objects.filter(cart=cart, product=product).first()
        
        if existing_item:
            existing_item.quantity += serializer.validated_data.get('quantity', 1)
            existing_item.save()
            # Прерываем стандартное создание, так как мы обновили существующий
            # Но DRF ждет instance, поэтому это хак, либо нужно переопределить create() целиком.
            # Для чистоты переопределим create ниже.
        else:
            serializer.save(cart=cart)

    def create(self, request, *args, **kwargs):
        # Кастомный create для обработки логики "Добавить или Увеличить"
        cart = self.get_cart(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)

        # Пытаемся найти и обновить, или создать
        item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            # Если уже было - плюсуем количество
            item.quantity += quantity
            item.save()

        # Возвращаем актуальное состояние этого айтема
        read_serializer = CartItemSerializer(item, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class WishlistViewSet(viewsets.ModelViewSet):
    """
    Избранное. Доступно только авторизованным.
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Удобная action для toggle (лайк/дизлайк одним запросом)
    # URL: /api/wishlist/toggle/ { "product_id": 1 }
    def create(self, request, *args, **kwargs):
        # Переопределяем create, чтобы сделать toggle (если есть - удалить, если нет - добавить)
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "product_id is required"}, status=400)
            
        product = get_object_or_404(Product, id=product_id)
        
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user, 
            product=product
        )

        if not created:
            # Если уже было в избранном — удаляем
            wishlist_item.delete()
            return Response({"message": "Removed from wishlist", "is_in_wishlist": False}, status=200)
        
        # Если создали
        serializer = self.get_serializer(wishlist_item)
        return Response({**serializer.data, "is_in_wishlist": True}, status=201)