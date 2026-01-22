export interface IBrand {
  name: string;
  logo?: string;
  slug?: string;
}

export interface IProductImage {
  id: number | string;
  image: string;
  is_main?: boolean;
}

export type SpecificationsType = Record<string, string | number>;

export interface IProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount_price: string | null;
  stock: number;
  is_active: boolean;
  specifications: SpecificationsType;
  images?: IProductImage[];
  brand: IBrand | any | null;
  category: string;
  main_image: string | null; 
  is_in_cart: boolean;
  is_in_wishlist: boolean;
}




export interface ProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IProduct[];
}
export interface CartItem {
  id: number; 
  product: IProduct;
  quantity: number;
  subtotal: string;
}

export interface CartResponse {
  results: CartItem[];
  count: number;
}










// --- Store Types ---

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  parent: number | null;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface ProductList {
  id: number;
  name: string;
  slug: string;
  price: string; // Decimal field usually comes as string in JSON
  discount_price: string | null;
  price_display: number;
  category: string;
  brand: string | null;
  main_image: string | null;
  stock: number;
  is_active: boolean;
}

export interface ProductDetail extends ProductList {
  description: string;
  specifications: Record<string, any>; // JSONField
  images: { id: number; image: string; is_main: boolean }[];
  // Поля category и brand здесь объекты, а не строки, согласно ProductDetailSerializer
  category_obj: Category; 
  brand_obj: Brand;
}

// --- Cart Types ---

export interface CartItem {
  id: number;
  product: IProduct;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: number;
  total_items: number;
}

// --- Wishlist Types ---

export interface WishlistItem {
  id: number;
  product: ProductList;
  added_at: string;
}

export interface WishlistToggleResponse {
  is_in_wishlist: boolean;
  message?: string;
}

// --- Order Types ---

export interface OrderItem {
  id: number;
  product_name: string;
  price: string;
  quantity: number;
  get_cost: number;
}

export interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
  items: OrderItem[];
  delivery_address: string;
}

export interface CreateOrderPayload {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  delivery_address: string;
}

// --- Filter Params ---
export interface ProductParams {
  page?: number;
  search?: string;
  category?: string; // slug
  brand?: string; // slug
  ordering?: string; // 'price' or '-price'
  min_price?: number;
  max_price?: number;
}