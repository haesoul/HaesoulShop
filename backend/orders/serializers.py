from rest_framework import serializers
from .models import Order, OrderItem
# Импортируем Cart (предполагаем, что он в приложении carts или store)
# from carts.models import Cart 

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Сериализатор позиции в заказе.
    Исключительно для чтения (история заказов).
    """
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'price', 'quantity', 'get_cost']

class OrderReadSerializer(serializers.ModelSerializer):
    """
    Полный просмотр заказа со списком товаров.
    """
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'is_paid', 'created_at', 'total_price',
            'first_name', 'last_name', 'phone', 'email', 'delivery_address',
            'items'
        ]

class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для СОЗДАНИЯ заказа.
    Пользователь шлет только контактные данные.
    Сумма и товары подтягиваются с бэкенда.
    """
    class Meta:
        model = Order
        fields = [
            'first_name', 'last_name', 'phone', 'email', 'delivery_address'
        ]