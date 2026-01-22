import AnimatedButton from '@/components/Basic/Button/AnimatedButton';
import { formatPrice } from '@/tools';
import { addToCart, getProductBySlug, toggleWishlist } from '@/tools/store';
import { IProduct, IProductImage } from '@/types/store';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
const { width } = Dimensions.get('window');




const ProductDetailScreen = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);


  useEffect(() => {
    if (slug) {
      getProductBySlug({
        slug,
        setProduct,
        setLoading,
        onError: () => router.canGoBack() ? router.back() : router.replace('/')
      });
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(
        product.id,
        1,
        setAdding
      );
    }
  };
  const handleToggleWishList = async () => {
    if (!product) return;

    const res = await toggleWishlist(product.id);

    setProduct(prev =>
      prev
        ? { ...prev, is_in_wishlist: res.is_in_wishlist }
        : prev
    );
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImgIndex(Math.round(index));
  };

  // const formatPrice = (price: string | number) => {
  //   return Number(price).toLocaleString('ru-RU', {
  //     style: 'currency',
  //     currency: 'RUB',
  //     minimumFractionDigits: 0,
  //   });
  // };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!product) return null;

  const images: IProductImage[] = 
    product.images && product.images.length > 0 
      ? product.images 
      : [{ id: 'default', image: 'https://via.placeholder.com/400x400?text=No+Image' }];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: product.name,
          headerTitleStyle: { fontSize: 16 }
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {images.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeImgIndex === index ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          {product.brand && (
            <Text style={styles.brandText}>{product.brand.name}</Text>
          )}

          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.priceContainer}>
            {product.discount_price ? (
              <>
                <Text style={styles.currentPrice}>
                  {formatPrice(product.discount_price)}
                </Text>
                <Text style={styles.oldPrice}>
                  {formatPrice(product.price)}
                </Text>
              </>
            ) : (
              <Text style={styles.currentPrice}>
                {formatPrice(product.price)}
              </Text>
            )}
          </View>

          <View style={styles.stockContainer}>
            <View style={[
              styles.stockBadge, 
              product.stock > 0 ? styles.bgGreen : styles.bgRed
            ]}>
              <Text style={[
                styles.stockBadgeText, 
                product.stock > 0 ? styles.textGreen : styles.textRed
              ]}>
                {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>
            {product.description || 'Описание отсутствует.'}
          </Text>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.specsContainer}>
              <Text style={styles.sectionTitle}>Характеристики</Text>
              {Object.entries(product.specifications).map(([key, value], index) => (
                <View key={index} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}:</Text>
                  <Text style={styles.specValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.rowContent}>
          <AnimatedButton
            pressableStyle={{flex: 4}}
            style={[
              styles.buyButton,
              (product.stock === 0 || product.is_in_cart) && styles.disabledButton,
            ]}
            disabled={product.stock === 0 || product.is_in_cart}
            onPress={async () => {
              if (!product.is_in_cart) {
                await handleAddToCart()
              }
            }}
          >
            <Ionicons
              name={product.is_in_cart ? 'cart' : 'cart-outline'}
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />

            <Text style={styles.buyButtonText}>
              {product.stock === 0
                ? 'Раскуплено'
                : product.is_in_cart
                  ? 'В корзине'
                  : 'В корзину'}
            </Text>
          </AnimatedButton>
          <AnimatedButton pressableStyle={{flex: 1}} style={{paddingHorizontal: 0}} onPress={handleToggleWishList}>
            <Ionicons
              name="heart"
              size={24}
              color={product.is_in_wishlist ? "red" : "white"}
            />      
          </AnimatedButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  galleryContainer: { height: 350, position: 'relative', backgroundColor: '#f9f9f9' },
  image: { width: width, height: 350 },
  pagination: { position: 'absolute', bottom: 15, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { backgroundColor: '#4F46E5' },
  inactiveDot: { backgroundColor: 'rgba(0,0,0,0.2)' },
  infoContainer: { padding: 20, paddingBottom: 100 },
  brandText: { fontSize: 14, color: '#6B7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
  currentPrice: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  oldPrice: { fontSize: 18, color: '#9CA3AF', textDecorationLine: 'line-through', marginLeft: 12, marginBottom: 4 },
  stockContainer: { marginBottom: 20, flexDirection: 'row' },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bgGreen: { backgroundColor: '#D1FAE5' },
  bgRed: { backgroundColor: '#FEE2E2' },
  textGreen: { color: '#065F46', fontSize: 12, fontWeight: '600' },
  textRed: { color: '#991B1B', fontSize: 12, fontWeight: '600' },
  stockBadgeText: {},
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 10, marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 24, color: '#4B5563', marginBottom: 20 },
  specsContainer: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 15 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  specKey: { fontSize: 14, color: '#6B7280', flex: 1 },
  specValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  buyButton: { backgroundColor: '#4F46E5', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12},
  disabledButton: { backgroundColor: '#9CA3AF' },
  buyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rowContent: {flexDirection: "row"}
});

export default ProductDetailScreen;