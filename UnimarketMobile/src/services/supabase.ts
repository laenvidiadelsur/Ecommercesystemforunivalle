import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import * as SecureStore from 'expo-secure-store';
import { STORAGE } from '../constants';

// Get environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Custom storage adapter for Expo Secure Store
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from secure store:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in secure store:', error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from secure store:', error);
    }
  },
};

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'unimarket-mobile',
    },
  },
});

// Auth service
export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Get user profile
    if (data.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      return {
        user: profile as UserProfile,
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
      };
    }
    
    throw new Error('No user data returned');
  },
  
  async register(userData: {
    email: string;
    password: string;
    nombre: string;
    carnet: string;
    telefono?: string;
    direccion?: string;
    rol: 'estudiante' | 'vendedor';
  }) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    
    if (error) throw error;
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: data.user.id,
          email: userData.email,
          nombre: userData.nombre,
          carnet: userData.carnet,
          telefono: userData.telefono,
          direccion: userData.direccion,
          rol: userData.rol,
        }]);
      
      if (profileError) throw profileError;
      
      return {
        user: {
          id: data.user.id,
          email: userData.email,
          nombre: userData.nombre,
          carnet: userData.carnet,
          telefono: userData.telefono,
          direccion: userData.direccion,
          rol: userData.rol,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile,
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
      };
    }
    
    throw new Error('No user data returned');
  },
  
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile as UserProfile | null;
    }
    
    return null;
  },
  
  async updateProfile(data: { nombre?: string; telefono?: string; direccion?: string }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id);
    
    if (error) throw error;
    
    return await this.getCurrentUser();
  },
  
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'unimarket://reset-password',
    });
    
    if (error) throw error;
  },
  
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Products service
export const productsService = {
  async getProducts(filters: {
    category?: string;
    search?: string;
    sort?: 'reciente' | 'precio_asc' | 'precio_desc' | 'nombre';
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        vendedor:user_profiles(*),
        categoria:categories(*)
      `)
      .eq('activo', true);
    
    if (filters.category) {
      query = query.eq('categoria_id', filters.category);
    }
    
    if (filters.search) {
      query = query.textSearch('nombre', filters.search);
    }
    
    if (filters.sort) {
      switch (filters.sort) {
        case 'reciente':
          query = query.order('created_at', { ascending: false });
          break;
        case 'precio_asc':
          query = query.order('precio', { ascending: true });
          break;
        case 'precio_desc':
          query = query.order('precio', { ascending: false });
          break;
        case 'nombre':
          query = query.order('nombre', { ascending: true });
          break;
      }
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return {
      data: data as any[],
      total: data?.length || 0,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };
  },
  
  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendedor:user_profiles(*),
        categoria:categories(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data as any;
  },
  
  async searchProducts(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendedor:user_profiles(*),
        categoria:categories(*)
      `)
      .eq('activo', true)
      .textSearch('nombre', query)
      .limit(20);
    
    if (error) throw error;
    
    return data as any[];
  },
  
  async getProductsByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendedor:user_profiles(*),
        categoria:categories(*)
      `)
      .eq('activo', true)
      .eq('categoria_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as any[];
  },
  
  async getVendorProducts(vendorId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendedor:user_profiles(*),
        categoria:categories(*)
      `)
      .eq('vendedor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as any[];
  },
  
  async createProduct(productData: {
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    categoria_id: string;
    imagen_url?: string;
    imagenes_adicionales?: string[];
  }) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        vendedor_id: user.id,
        activo: true,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },
  
  async updateProduct(id: string, productData: any) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },
  
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .update({ activo: false })
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Cart service
export const cartService = {
  async getCart() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    
    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('usuario_id', user.id)
      .single();
    
    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert([{ usuario_id: user.id }])
        .select()
        .single();
      cart = newCart;
    }
    
    // Get cart items
    const { data: items } = await supabase
      .from('cart_items')
      .select(`
        *,
        producto:products(*)
      `)
      .eq('carrito_id', cart.id);
    
    return {
      cartId: cart.id,
      items: items || [],
      total: (items || []).reduce((sum: number, item: any) => sum + (item.cantidad * item.precio_unitario), 0),
      itemCount: (items || []).reduce((sum: number, item: any) => sum + item.cantidad, 0),
    };
  },
  
  async addToCart(productId: string, quantity: number) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    
    // Get product
    const product = await productsService.getProductById(productId);
    if (!product) throw new Error('Product not found');
    
    // Get or create cart
    const cart = await this.getCart();
    
    // Check if item already exists
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('carrito_id', cart.cartId)
      .eq('producto_id', productId)
      .single();
    
    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ cantidad: existingItem.cantidad + quantity })
        .eq('id', existingItem.id)
        .select(`
          *,
          producto:products(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{
          carrito_id: cart.cartId,
          producto_id: productId,
          cantidad: quantity,
          precio_unitario: product.precio,
        }])
        .select(`
          *,
          producto:products(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  async updateCartItem(itemId: string, quantity: number) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ cantidad: quantity })
      .eq('id', itemId)
      .select(`
        *,
        producto:products(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async removeCartItem(itemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
  },
  
  async clearCart() {
    const cart = await this.getCart();
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('carrito_id', cart.cartId);
    
    if (error) throw error;
  },
};

// Orders service
export const ordersService = {
  async getOrders() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          producto:products(*)
        )
      `)
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as any[];
  },
  
  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          producto:products(*)
        ),
        usuario:user_profiles(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data as any;
  },
  
  async createOrder(orderData: {
    direccion_entrega: string;
    telefono_contacto: string;
    notas?: string;
  }) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    
    // Get cart items
    const cart = await cartService.getCart();
    if (cart.items.length === 0) throw new Error('Cart is empty');
    
    // Calculate total
    const total = cart.items.reduce((sum: number, item: any) => 
      sum + (item.cantidad * item.precio_unitario), 0
    );
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        usuario_id: user.id,
        numero_orden: orderNumber,
        total,
        estado: 'pendiente',
        ...orderData,
      }])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = cart.items.map((item: any) => ({
      orden_id: order.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Clear cart
    await cartService.clearCart();
    
    // Update product stock
    for (const item of cart.items) {
      await supabase
        .from('products')
        .update({ stock: item.producto.stock - item.cantidad })
        .eq('id', item.producto_id);
    }
    
    return order;
  },
  
  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ estado: status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async getVendorOrders() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('No user logged in');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          producto:products(*)
        ),
        usuario:user_profiles(*)
      `)
      .in('id', 
        supabase.from('order_items')
          .select('orden_id')
          .in('producto_id', 
            supabase.from('products')
              .select('id')
              .eq('vendedor_id', user.id)
          )
      )
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as any[];
  },
};

// Categories service
export const categoriesService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    
    return data;
  },
  
  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  },
};