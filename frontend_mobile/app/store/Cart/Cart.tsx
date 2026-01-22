import CartItemRow from '@/components/Store/CarItem/CartItem';
import { API_URL } from '@/CONSTANTS';
import { useTheme } from '@/hooks/System/useThemedBackground';
import { api } from '@/tools/auth';
import { getCartItems } from '@/tools/store';
import { CartItem } from '@/types/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';






export default function CartScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCartItems();
        if (data) {
          setCartItems(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const previousItems = [...cartItems];
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
    setUpdatingIds(prev => [...prev, itemId]);

    try {
      const token = await SecureStore.getItemAsync('access_token');
      await api.patch(
        `${API_URL}api/cart/cart-items/${itemId}/`,
        { quantity: newQuantity },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (error) {
      console.error('Ошибка обновления:', error);
      setCartItems(previousItems);
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== itemId));
    }
  };

  const removeItem = (itemId: number) => {
    Alert.alert(
      "Удаление",
      "Убрать товар из корзины?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Удалить", 
          style: "destructive", 
          onPress: async () => {
            const previousItems = [...cartItems];
            setCartItems(prev => prev.filter(item => item.id !== itemId));

            try {
              const token = await SecureStore.getItemAsync('access_token');
              await api.delete(`${API_URL}api/cart/cart-items/${itemId}/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
            } catch (error) {
              setCartItems(previousItems);
              Alert.alert('Ошибка', 'Не удалось удалить товар');
            }
          }
        }
      ]
    );
  };

  const handleIncrease = useCallback((id: number, qty: number) => {
    if (!updatingIds.includes(id)) updateQuantity(id, qty + 1);
  }, [updatingIds, cartItems]);

  const handleDecrease = useCallback((id: number, qty: number) => {
    if (qty > 1 && !updatingIds.includes(id)) {
      updateQuantity(id, qty - 1);
    } else if (qty === 1) {
      removeItem(id);
    }
  }, [updatingIds, cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product.discount_price 
        ? parseFloat(item.product.discount_price) 
        : parseFloat(item.product.price);
      return acc + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {cartItems.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cart-outline" size={64} color={colors.text + '50'} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Корзина пуста</Text>
          <TouchableOpacity 
            style={[styles.shopButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Перейти к покупкам</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CartItemRow 
                item={item} 
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={removeItem}
                colors={colors}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
          
          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.background }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Итого:</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {totalPrice.toLocaleString('ru-RU')} ₽
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Оформление', 'Переход к оплате...')}
            >
              <Text style={styles.checkoutText}>Оформить заказ</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

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