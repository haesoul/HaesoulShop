import { API_URL } from '@/CONSTANTS';
import { CartResponse, IProduct, ProductResponse } from '@/types/store';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import {
  Cart,
  Category,
  CreateOrderPayload,
  Order,
  ProductParams,
  WishlistItem, WishlistToggleResponse
} from '../types/store';
import { api, getAuthHeaders } from './auth';


interface FetchProductArgs {
  slug: string;
  setProduct: (product: IProduct) => void;
  setLoading: (loading: boolean) => void;
  onError: () => void;
}





export const getProductBySlug = async ({
  slug,
  setProduct,
  setLoading,
  onError,
}: FetchProductArgs) => {
  try {
    const token = await SecureStore.getItemAsync('access_token')

    const response = await api.get(
      `${API_URL}api/store/products/${slug}/`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    )

    setProduct(response.data)
  } catch (error) {
    console.error(error)
    Alert.alert('Ошибка', 'Не удалось загрузить информацию о товаре')
    onError()
  } finally {
    setLoading(false)
  }
}







// ================= STORE (Каталог) =================

export const getCategories = async () => {
  const response = await api.get<Category[]>('api/store/categories/');
  return response.data;
};


export const getProducts = async (
  params: ProductParams = {},
  url?: string | null
): Promise<ProductResponse> => {
  const response = await api.get<ProductResponse>(
    url ?? 'api/store/products/',
    { params }
  );
  return response.data;
};

// ================= CART (Корзина) =================

// Получить всю корзину (GET /api/cart/cart/)
export const getCart = async () => {
  const headers = await getAuthHeaders();
  const response = await api.get<Cart>('api/cart/cart/', { headers });
  return response.data;
};
export const getCartItems = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<CartResponse>(`${API_URL}api/cart/cart-items/`, {headers});
    return response.data.results
  } catch (error) {
    console.error('Ошибка загрузки корзины:', error);
  }
}
// Добавить товар (POST /api/cart/cart-items/)
export const addToCart = async (productId: number, quantity: number = 1, setAdding: (adding: boolean) => void) => {
  setAdding(true);
  const headers = await getAuthHeaders();
  const response = await api.post(
    'api/cart/cart-items/',
    { product_id: productId, quantity },
    { headers }
  );
  setAdding(false)
  return response.data;
  
};

export async function getCartItem(itemId: number) {
  const headers = await getAuthHeaders();
  const response = await api.get(`api/cart/cart-items/${itemId}`, {headers})
  return response.data
}
// Изменить количество (PATCH /api/cart/cart-items/{id}/)
export const updateCartItem = async (itemId: number, quantity: number) => {
  const headers = await getAuthHeaders();
  const response = await api.patch(
    `api/cart/cart-items/${itemId}/`,
    { quantity },
    { headers }
  );
  return response.data;
};

// Удалить товар (DELETE /api/cart/cart-items/{id}/)
export const removeFromCart = async (itemId: number) => {
  const headers = await getAuthHeaders();
  await api.delete(`api/cart/cart-items/${itemId}/`, { headers });
  return true;
};

// ================= WISHLIST (Избранное) =================

export const getWishlist = async () => {
  const headers = await getAuthHeaders();
  const response = await api.get<{ results: WishlistItem[] }>('api/cart/wishlist/', { headers });
  return response.data.results;
};

// Лайк/Дизлайк (POST /api/cart/wishlist/)
// Backend сам решает добавить или удалить на основе наличия
export const toggleWishlist = async (productId: number) => {
  const headers = await getAuthHeaders();
  const response = await api.post<WishlistToggleResponse>(
    'api/cart/wishlist/',
    { product_id: productId },
    { headers }
  );
  return response.data; // Вернет { is_in_wishlist: true/false }
};


export const getOrders = async () => {
  const headers = await getAuthHeaders();
  const response = await api.get<{ results: Order[] }>('api/orders/orders/', { headers });
  return response.data.results;
};

export const createOrder = async (orderData: CreateOrderPayload) => {
  const headers = await getAuthHeaders();
  const response = await api.post<Order>(
    'api/orders/orders/',
    orderData,
    { headers }
  );
  return response.data;
};