import { IProduct } from "@/types/store";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";



const { width } = Dimensions.get('window');
export const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 50) / COLUMN_COUNT;


const ProductCard = React.memo(({ item, colors }: { item: IProduct; colors: any }) => {
  const price = parseFloat(item.price);
  const discountPrice = item.discount_price ? parseFloat(item.discount_price) : null;
  const currentPrice = discountPrice ?? price;
  const hasDiscount = discountPrice !== null;

  return (
    <View style={[styles.card, { backgroundColor: colors.color + '40' }]}>
      <View style={styles.imageContainer}>
        {item.main_image ? (
          <Image 
            source={{ uri: item.main_image }} 
            style={styles.image} 
            resizeMode="cover" 
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.color }]}>
            <Text style={{ color: colors.text, fontSize: 10 }}>Нет фото</Text>
          </View>
        )}
        {hasDiscount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SALE</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        {item.brand && (
          <Text style={[styles.brandText, { color: colors.text, opacity: 0.6 }]}>
            {item.brand}
          </Text>
        )}
        <Text 
          style={[styles.productName, { color: colors.text }]} 
          numberOfLines={2}
        >
          {item.name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {currentPrice.toFixed(0)} ₽
          </Text>
          {hasDiscount && (
            <Text style={[styles.oldPriceText, { color: colors.text }]}>
              {price.toFixed(0)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
});

export default ProductCard

const styles = StyleSheet.create({
  listContent: { padding: 0 },
  columnWrapper: { justifyContent: 'space-between' },
  headerContainer: { paddingVertical: 10, marginBottom: 10 },
  searchInput: { height: 44, borderRadius: 8, borderWidth: 1, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  sortContainer: { flexDirection: 'row', gap: 8 },
  sortButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  sortButtonText: { fontSize: 12, fontWeight: '600' },
  card: { width: ITEM_WIDTH, marginBottom: 16, borderRadius: 12, overflow: 'hidden', margin: 3 },
  imageContainer: { height: ITEM_WIDTH, width: '100%', position: 'relative' },
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
});