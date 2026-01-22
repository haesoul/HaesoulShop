import { WishlistItem } from "@/types/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const WishListItemRow = React.memo(({ 
  item, 
  onRemove, 
  colors 
}: { 
  item: WishlistItem; 
  onRemove: (id: number) => void;
  colors: any;
}) => {
  const router = useRouter()

  const currentPrice = item.product.discount_price 
    ? parseFloat(item.product.discount_price) 
    : parseFloat(item.product.price);

  return (
    <TouchableOpacity onPress={() => router.push(`/store/Product/${item.product.slug}`)}>
      <View style={[styles.itemContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image
          source={item.product.main_image ? { uri: item.product.main_image } : require('@/assets/app/placeholder.jpg')}
          style={styles.itemImage}
          resizeMode="cover"
        />

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
              {item.product.name}
            </Text>
            <TouchableOpacity onPress={() => onRemove(item.id)} hitSlop={10}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.itemPrice, { color: colors.text }]}>
            {currentPrice.toLocaleString('ru-RU')} ₽
          </Text>

        </View>
      </View>
    </TouchableOpacity>
  );
});

export default WishListItemRow
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
  
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
  },

  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.6,
  },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});