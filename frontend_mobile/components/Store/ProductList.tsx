import { useTheme } from '@/hooks/System/useThemedBackground';
import { getProducts } from '@/tools/store';
import { IProduct } from '@/types/store';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ProductCard, { COLUMN_COUNT } from './ProductCard/ProductCard';


// const { width } = Dimensions.get('window');
// const COLUMN_COUNT = 2;
// const ITEM_WIDTH = (width - 50) / COLUMN_COUNT;

// const ProductCard = React.memo(({ item, colors }: { item: IProduct; colors: any }) => {
//   const price = parseFloat(item.price);
//   const discountPrice = item.discount_price ? parseFloat(item.discount_price) : null;
//   const currentPrice = discountPrice ?? price;
//   const hasDiscount = discountPrice !== null;

//   return (
//     <View style={[styles.card, { backgroundColor: colors.inputBorder + '20' }]}>
//       <View style={styles.imageContainer}>
//         {item.main_image ? (
//           <Image 
//             source={{ uri: item.main_image }} 
//             style={styles.image} 
//             resizeMode="cover" 
//           />
//         ) : (
//           <View style={[styles.imagePlaceholder, { backgroundColor: colors.inputBorder }]}>
//             <Text style={{ color: colors.text, fontSize: 10 }}>Нет фото</Text>
//           </View>
//         )}
//         {hasDiscount && (
//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>SALE</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.cardContent}>
//         {item.brand && (
//           <Text style={[styles.brandText, { color: colors.text, opacity: 0.6 }]}>
//             {item.brand}
//           </Text>
//         )}
//         <Text 
//           style={[styles.productName, { color: colors.text }]} 
//           numberOfLines={2}
//         >
//           {item.name}
//         </Text>

//         <View style={styles.priceContainer}>
//           <Text style={[styles.priceText, { color: colors.primary }]}>
//             {currentPrice.toFixed(0)} ₽
//           </Text>
//           {hasDiscount && (
//             <Text style={[styles.oldPriceText, { color: colors.text }]}>
//               {price.toFixed(0)}
//             </Text>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// });


type SortOption = 'price' | '-price' | '-created_at' | '';

export const ProductList = () => {
  const { colors } = useTheme();
  const router = useRouter()

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true); 
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 
  const [nextPage, setNextPage] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<SortOption>('');

  const fetchProducts = async (
    url?: string | null,
    isRefresh = false
  ) => {
    if (!url && !isRefresh && products.length > 0) return;

    try {
      const data = await getProducts(
        url
          ? {}
          : {
              search,
              ordering: orderBy,
            },
        url
      );

      setProducts((prev) =>
        isRefresh || !url
          ? data.results
          : [...prev, ...data.results]
      );

      setNextPage(data.next);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((text: string) => {
        setLoading(true);
        fetchProducts(null, true); 
      }, 2000),
    [orderBy]
  );

  const handleSearchChange = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts(null, true);
  }, [orderBy]);

  const handleLoadMore = () => {
    if (nextPage && !loadingMore && !loading) {
      setLoadingMore(true);
      fetchProducts(nextPage);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(null, true);
  };

  const renderItem: ListRenderItem<IProduct> = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => router.push(`/store/Product/${item.slug}`)}><ProductCard item={item} colors={colors} /></TouchableOpacity>
  ), [colors]);

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
      <TextInput
        style={[
          styles.searchInput,
          { 
            backgroundColor: colors.inputBorder + '30', 
            color: colors.text,
            borderColor: colors.inputBorder
          }
        ]}
        placeholder="Поиск товаров..."
        placeholderTextColor={colors.text + '80'}
        value={search}
        onChangeText={handleSearchChange}
      />
      <View style={styles.sortContainer}>
        <SortButton title="Новинки" active={orderBy === '-created_at'} onPress={() => setOrderBy('-created_at')} colors={colors} />
        <SortButton title="Дешевле" active={orderBy === '-price'} onPress={() => setOrderBy('-price')} colors={colors} />
        <SortButton title="Дороже" active={orderBy === 'price'} onPress={() => setOrderBy('price')} colors={colors} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {loading && !refreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={COLUMN_COUNT}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          // ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const SortButton = ({ title, active, onPress, colors }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.sortButton,
      { 
        backgroundColor: active ? colors.primary : 'transparent',
        borderColor: active ? colors.primary : colors.inputBorder
      }
    ]}
  >
    <Text style={[styles.sortButtonText, { color: active ? '#FFF' : colors.text }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 0 },
  columnWrapper: { justifyContent: 'space-between' },
  headerContainer: { paddingVertical: 10, marginBottom: 10 },
  searchInput: { height: 44, borderRadius: 8, borderWidth: 1, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  sortContainer: { flexDirection: 'row', gap: 8 },
  sortButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  sortButtonText: { fontSize: 12, fontWeight: '600' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF3B30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardContent: { padding: 10 },
  brandText: { fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  productName: { fontSize: 14, fontWeight: '500', marginBottom: 8, height: 40 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceText: { fontSize: 16, fontWeight: 'bold' },
  oldPriceText: { fontSize: 12, textDecorationLine: 'line-through', opacity: 0.6 },
  loaderFooter: { paddingVertical: 20, alignItems: 'center' },
});

export default ProductList;