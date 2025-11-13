// Direct Supabase API calls without Edge Functions
import { supabase } from './client';
import type { Product, Category, CartResponse, CartItem, Order, UserProfile } from '../../types';

// Products
export const directProductsAPI = {
  getAll: async (params?: { categoria?: string; busqueda?: string; orden?: string }) => {
    let query = supabase
      .from('products')
      .select(`
        *,
        categoria:categories(id, nombre),
        vendedor:user_profiles(id, nombre)
      `)
      .eq('activo', true);

    if (params?.categoria) {
      query = query.eq('categoria_id', params.categoria);
    }

    if (params?.busqueda) {
      query = query.or(`nombre.ilike.%${params.busqueda}%,descripcion.ilike.%${params.busqueda}%`);
    }

    const orderMap: any = {
      'reciente': { column: 'created_at', ascending: false },
      'precio_asc': { column: 'precio', ascending: true },
      'precio_desc': { column: 'precio', ascending: false },
      'nombre': { column: 'nombre', ascending: true },
    };

    const orderBy = orderMap[params?.orden || 'reciente'] || orderMap['reciente'];
    query = query.order(orderBy.column, { ascending: orderBy.ascending });

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data as Product[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categoria:categories(id, nombre),
        vendedor:user_profiles(id, nombre, telefono)
      `)
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) throw error;
    return data as Product;
  },

  create: async (productData: {
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    categoria_id?: string;
    imagen_url?: string;
    imagenes_adicionales?: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        vendedor_id: user.id,
        activo: true
      })
      .select(`
        *,
        categoria:categories(id, nombre),
        vendedor:user_profiles(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as Product;
  },

  getMyProducts: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categoria:categories(id, nombre)
      `)
      .eq('vendedor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  },
};

// Categories
export const directCategoriesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;
    return data as Category[];
  },
};

// Cart
export const directCartAPI = {
  get: async (): Promise<CartResponse> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Get or create cart
    let { data: cart, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (!cart) {
      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError) throw createError;
      cart = newCart;
    }

    // Get cart items
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        producto:products(*)
      `)
      .eq('cart_id', cart.id);

    if (itemsError) throw itemsError;

    const cartItems: CartItem[] = (items || []).map((item: any) => ({
      id: item.id,
      carrito_id: item.cart_id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario || item.producto?.precio || 0,
      created_at: item.created_at,
      producto: item.producto,
    }));

    return {
      carrito_id: cart.id,
      items: cartItems,
      total: cartItems.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0),
      cantidad_items: cartItems.reduce((sum, item) => sum + item.cantidad, 0),
    };
  },

  addItem: async (producto_id: string, cantidad: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // First, get the product to get price and verify stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, precio, stock, activo')
      .eq('id', producto_id)
      .single();

    if (productError || !product) {
      throw new Error('Producto no encontrado');
    }

    if (!product.activo) {
      throw new Error('Producto no disponible');
    }

    if (product.stock < cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
    }

    // Get or create cart (using user_id as per schema)
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (cartError) throw cartError;
      cart = newCart;
    }

    // Check if item already exists (using cart_id as per schema)
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('producto_id', producto_id)
      .maybeSingle();

    if (existing) {
      // Update quantity and verify stock
      const newCantidad = existing.cantidad + cantidad;
      if (product.stock < newCantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ cantidad: newCantidad })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insert new item with precio_unitario (using cart_id as per schema)
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          producto_id,
          cantidad,
          precio_unitario: product.precio
        });
      if (error) throw error;
    }
  },

  updateItem: async (itemId: string, cantidad: number) => {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    // Get the cart item to verify stock
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select(`
        *,
        producto:products(id, stock, activo)
      `)
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      throw new Error('Item del carrito no encontrado');
    }

    const product = item.producto as any;
    if (!product.activo) {
      throw new Error('Producto no disponible');
    }

    if (product.stock < cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ cantidad })
      .eq('id', itemId);
    if (error) throw error;
  },

  removeItem: async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  },

  clear: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (cart) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
      if (error) throw error;
    }
  },
};

// Auth - Direct Supabase operations
export const directAuthAPI = {
  signup: async (signupData: {
    email: string;
    password: string;
    nombre: string;
    rol?: 'estudiante' | 'vendedor' | 'admin';
    carnet?: string;
    telefono?: string;
    direccion?: string;
  }): Promise<UserProfile> => {
    // Create user in Supabase Auth with all metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nombre: signupData.nombre,
          rol: signupData.rol || 'estudiante',
          carnet: signupData.carnet,
          telefono: signupData.telefono,
          direccion: signupData.direccion
        }
      }
    });

    if (authError) {
      throw new Error(`Error al crear usuario: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // If email confirmation is required but user is not confirmed, 
    // we still proceed to create the profile (user can confirm later)
    // The session might be null if email confirmation is required

    // Wait a bit for the trigger to execute (if it exists)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to get the profile (might have been created by trigger)
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    // If profile doesn't exist (trigger didn't run), create it manually
    if (!profile) {
      // Try using the function first (bypasses RLS)
      const { data: functionProfile, error: functionError } = await supabase
        .rpc('create_user_profile', {
          p_id: authData.user.id,
          p_email: signupData.email,
          p_nombre: signupData.nombre,
          p_rol: signupData.rol || 'estudiante',
          p_carnet: signupData.carnet || null,
          p_telefono: signupData.telefono || null,
          p_direccion: signupData.direccion || null
        });

      if (!functionError && functionProfile) {
        profile = functionProfile as UserProfile;
      } else {
        // Fallback: try direct insert (should work with updated RLS policy)
        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: signupData.email,
            nombre: signupData.nombre,
            rol: signupData.rol || 'estudiante',
            carnet: signupData.carnet,
            telefono: signupData.telefono,
            direccion: signupData.direccion
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(`Error al crear perfil: ${profileError.message}`);
        }
        profile = newProfile;
      }
    } else {
      // Profile exists, but might need to update with additional data
      if (signupData.carnet || signupData.telefono || signupData.direccion) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            carnet: signupData.carnet,
            telefono: signupData.telefono,
            direccion: signupData.direccion
          })
          .eq('id', authData.user.id)
          .select()
          .single();
        
        if (!updateError && updatedProfile) {
          profile = updatedProfile;
        }
      }
    }

    return profile as UserProfile;
  },

  getProfile: async (): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile as UserProfile;
  },
};

