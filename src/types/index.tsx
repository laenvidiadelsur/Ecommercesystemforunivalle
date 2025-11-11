// User & Auth
export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  rol: 'estudiante' | 'vendedor' | 'admin';
  carnet?: string;
  telefono?: string;
  direccion?: string;
  created_at: string;
  updated_at?: string;
}

// Category
export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  activo: boolean;
  created_at: string;
}

// Product
export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id?: string;
  vendedor_id?: string;
  imagen_url?: string;
  imagenes_adicionales?: string[];
  activo: boolean;
  created_at: string;
  updated_at?: string;
  categoria?: Category;
  vendedor?: Partial<UserProfile>;
}

// Cart
export interface Cart {
  id: string;
  usuario_id: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  carrito_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  created_at: string;
  producto?: Product;
}

export interface CartResponse {
  carrito_id: string;
  items: CartItem[];
  total: number;
  cantidad_items: number;
}

// Order
export type OrderStatus = 'pendiente' | 'confirmada' | 'enviada' | 'entregada' | 'cancelada';

export interface Order {
  id: string;
  numero_orden: string;
  usuario_id: string;
  total: number;
  estado: OrderStatus;
  direccion_entrega: string;
  telefono_contacto: string;
  notas?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  usuario?: Partial<UserProfile>;
}

export interface OrderItem {
  id: string;
  orden_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
  producto?: Partial<Product>;
}

// Admin Stats
export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: Array<{ id: string; nombre: string; stock: number }>;
}

// API Request/Response types
export interface SignupRequest {
  email: string;
  password: string;
  nombre: string;
  rol?: 'estudiante' | 'vendedor' | 'admin';
  carnet?: string;
  telefono?: string;
  direccion?: string;
}

export interface CreateProductRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id?: string;
  imagen_url?: string;
  imagenes_adicionales?: string[];
}

export interface CreateOrderRequest {
  direccion_entrega: string;
  telefono_contacto: string;
  notas?: string;
}

export interface AddToCartRequest {
  producto_id: string;
  cantidad: number;
}
