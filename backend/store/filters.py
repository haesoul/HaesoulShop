from django_filters import rest_framework as filters
from .models import Product

class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = filters.NumberFilter(field_name="price", lookup_expr='lte')
    brand = filters.CharFilter(field_name="brand__slug") # Фильтр по слагу бренда
    category = filters.CharFilter(field_name="category__slug") # Фильтр по слагу категории
    
    class Meta:
        model = Product
        fields = ['is_active', 'brand', 'category']