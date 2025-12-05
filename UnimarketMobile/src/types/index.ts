// Core types for Unimarket Mobile App

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  rol: 'estudiante' | 'vendedor' | 'admin';
  carnet: string;
  telefono?: string;
  direccion?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  activo: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id: string;
  vendedor_id: string;
  imagen_url?: string;
  imagenes_adicionales?: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
  vendedor?: UserProfile;
  categoria?: Category;
}

export interface Cart {
  id: string;
  usuario_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  carrito_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  producto: Product;
  created_at: string;
}

export interface Order {
  id: string;
  numero_orden: string;
  usuario_id: string;
  total: number;
  estado: 'pendiente' | 'confirmada' | 'enviada' | 'entregada' | 'cancelada';
  direccion_entrega: string;
  telefono_contacto: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  usuario?: UserProfile;
}

export interface OrderItem {
  id: string;
  orden_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: Product;
  created_at: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  carnet: string;
  telefono?: string;
  direccion?: string;
  rol: 'estudiante' | 'vendedor';
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: 'reciente' | 'precio_asc' | 'precio_desc' | 'nombre';
  limit?: number;
  offset?: number;
}

export interface CreateProductData {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id: string;
  imagen_url?: string;
  imagenes_adicionales?: string[];
}

export interface CreateOrderData {
  direccion_entrega: string;
  telefono_contacto: string;
  notas?: string;
}

export interface UpdateProfileData {
  nombre?: string;
  telefono?: string;
  direccion?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderDetail: { orderId: string };
  EditProfile: undefined;
  VendorDashboard: undefined;
  VendorProducts: undefined;
  VendorOrders: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  HomeStack: undefined;
  CatalogStack: undefined;
  CartStack: undefined;
  OrdersStack: undefined;
  ProfileStack: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
};

export type CatalogStackParamList = {
  Catalog: undefined;
  Search: undefined;
  ProductDetail: { productId: string };
  Category: { categoryId: string };
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  HelpCenter: undefined;
  VendorDashboard: undefined;
  VendorProducts: undefined;
  VendorOrders: undefined;
};
