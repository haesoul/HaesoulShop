from rest_framework import viewsets, status, exceptions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderReadSerializer, OrderCreateSerializer

# Импорты моделей из прошлых шагов (подставьте свои пути)
from store.models import Product 

from cart.models import Cart
class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options'] # Запрещаем PUT/PATCH для заказов юзером

    def get_queryset(self):
        # Пользователь видит только свои заказы
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderReadSerializer

    def create(self, request, *args, **kwargs):
        """
        Процесс оформления заказа (Checkout).
        Переносит товары из корзины в заказ.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 1. Получаем корзину пользователя
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            raise exceptions.ValidationError("Корзина пуста или не найдена.")

        if not cart.items.exists():
            raise exceptions.ValidationError("Корзина пуста.")

        # Начинаем транзакцию: всё или ничего
        with transaction.atomic():
            # 2. Создаем "шапку" заказа
            order = Order.objects.create(
                user=request.user,
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                phone=serializer.validated_data['phone'],
                email=serializer.validated_data.get('email', request.user.email), # Если не указал, берем из профиля
                delivery_address=serializer.validated_data['delivery_address'],
                total_price=0, # Посчитаем ниже
                status='new'
            )

            total_price = 0
            order_items = []

            # 3. Перебираем товары в корзине и переносим в OrderItem
            for item in cart.items.select_related('product').all():
                product = item.product
                
                # Проверка наличия (на всякий случай, если кто-то купил за секунду до этого)
                if product.stock < item.quantity:
                    raise exceptions.ValidationError(f"Товара {product.name} недостаточно на складе.")

                # Снапшот цены и имени
                order_item = OrderItem(
                    order=order,
                    product=product,
                    product_name=product.name,
                    price=product.current_price, # Важно: берем текущую цену (со скидкой если есть)
                    quantity=item.quantity
                )
                order_items.append(order_item)
                
                total_price += order_item.price * order_item.quantity
                
                # Списываем со склада (опционально, зависит от бизнес-логики:
                # иногда списывают только после оплаты)
                product.stock -= item.quantity
                product.save()

            # Массовое создание записей (быстрее, чем в цикле)
            OrderItem.objects.bulk_create(order_items)

            # 4. Обновляем итоговую цену заказа
            order.total_price = total_price
            order.save()

            # 5. Очищаем корзину
            cart.items.all().delete()
            # cart.delete() # Если нужно удалять саму корзину, но обычно очищают items

        # Возвращаем созданный заказ
        read_serializer = OrderReadSerializer(order)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)