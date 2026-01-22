from rest_framework import serializers
from .models import *

# --- Вспомогательные сериализаторы ---

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo']

# --- Сериализатор Категорий (Рекурсивный) ---

class CategorySerializer(serializers.ModelSerializer):
    # Поле для отображения дочерних категорий (если нужно строить дерево меню)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'parent', 'children']

    def get_children(self, obj):
        # Возвращаем только прямых потомков
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True, context=self.context).data
        return []

# --- Сериализаторы Товаров ---

class ProductListSerializer(serializers.ModelSerializer):
    """
    Облегченный сериализатор для списков (каталога).
    Возвращает только главную картинку и основные цены.
    """
    category = serializers.CharField(source='category.name')
    brand = serializers.CharField(source='brand.name', default=None)
    main_image = serializers.SerializerMethodField()
    price_display = serializers.DecimalField(source='current_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'discount_price', 'price_display', 
                  'category', 'brand', 'main_image', 'stock', 'is_active']

    def get_main_image(self, obj):
        # Ищем картинку с флагом is_main, иначе берем первую попавшуюся
        main_img = obj.images.filter(is_main=True).first()
        if not main_img:
            main_img = obj.images.first()
        
        if main_img:
            # Возвращаем полный URL
            request = self.context.get('request')
            return request.build_absolute_uri(main_img.image.url) if request else main_img.image.url
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True, required=False, allow_null=True
    )
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    is_in_cart = serializers.BooleanField(read_only=True)
    is_in_wishlist = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 
            'price', 'discount_price', 'current_price',
            'stock', 'is_active', 'specifications',
            'category', 'category_id', 
            'brand', 'brand_id', 
            'images', 'uploaded_images',
            'is_in_cart', 'is_in_wishlist',
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        product = super().create(validated_data)
        
        for img in uploaded_images:
            ProductImage.objects.create(product=product, image=img)
        return product