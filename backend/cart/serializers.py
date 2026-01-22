from rest_framework import serializers
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Wishlist, Product
# Импортируем ProductListSerializer из предыдущего файла (предположим, он там же или рядом)
from store.serializers import ProductListSerializer 

class CartItemSerializer(serializers.ModelSerializer):
    """
    Сериализатор позиции в корзине.
    Выводит полную инфу о товаре (read_only) и принимает ID товара для добавления (write_only).
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), 
        source='product', 
        write_only=True
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        # Считаем сумму позиции: цена товара * количество
        return obj.product.current_price * obj.quantity

    def validate(self, data):
        """Проверка на наличие достаточного количества товара на складе"""
        quantity = data.get('quantity', 1)
        product = data.get('product') # Получаем из source='product'
        
        # Если это обновление (instance существует), нужно учесть разницу, 
        # но для простоты проверяем просто наличие.
        if product.stock < quantity:
            raise serializers.ValidationError(
                f"Недостаточно товара '{product.name}'. Доступно: {product.stock}"
            )
        return data


class CartSerializer(serializers.ModelSerializer):
    """
    Сериализатор самой корзины.
    Считает общую сумму и выводит список товаров.
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items']

    def get_total_price(self, obj):
        # Суммируем (цена * количество) по всем items
        return sum(item.product.current_price * item.quantity for item in obj.items.all())
    
    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())


class WishlistSerializer(serializers.ModelSerializer):
    """
    Сериализатор избранного.
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'added_at']