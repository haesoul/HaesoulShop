from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from cart.models import *
from .serializers import (
    CategorySerializer, BrandSerializer, 
    ProductListSerializer, ProductDetailSerializer
)
from .permissions import IsAdminOrReadOnly
from .filters import ProductFilter
from django.db.models import Exists, OuterRef, Value, BooleanField
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug' 

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category', 'brand').prefetch_related('images')
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at'] 
    
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        if not self.request.user.is_staff:
            qs = qs.filter(is_active=True)

        user = self.request.user

        if user.is_authenticated:
            cart = Cart.objects.filter(user=user).first()

            qs = qs.annotate(
                is_in_cart=Exists(
                    CartItem.objects.filter(
                        cart=cart,
                        product=OuterRef('pk')
                    )
                ),
                is_in_wishlist=Exists(
                    Wishlist.objects.filter(
                        user=user,
                        product=OuterRef('pk')
                    )
                )
            )
        else:
            qs = qs.annotate(
                is_in_cart=Value(False, output_field=BooleanField()),
                is_in_wishlist=Value(False, output_field=BooleanField()),
            )

        return qs

