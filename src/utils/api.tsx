import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7ff09ef6`;

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  // Validate configuration
  if (!projectId || !publicAnonKey) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${text}`);
    }

    if (!response.ok) {
      console.error(`API Error [${endpoint}]:`, data);
      throw new Error(data.error || data.message || `Error en la petición: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    // Enhanced error handling - throw error to allow fallback
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const connectionError = new Error('Edge Function no disponible, usando Supabase directo');
      (connectionError as any).isConnectionError = true;
      throw connectionError;
    }
    throw error;
  }
}

// Auth API with fallback to direct Supabase
export const authAPI = {
  signup: async (data: any, token?: string) => {
    try {
      return await fetchAPI('/auth/signup', { method: 'POST', body: JSON.stringify(data), token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión') || error.message.includes('no disponible')) {
        console.warn('Edge Function unavailable, using direct Supabase signup');
        const { directAuthAPI } = await import('./supabase/direct');
        return await directAuthAPI.signup(data);
      }
      throw error;
    }
  },
  
  getProfile: async (token: string) => {
    try {
      return await fetchAPI('/auth/profile', { token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión') || error.message.includes('no disponible')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directAuthAPI } = await import('./supabase/direct');
        return await directAuthAPI.getProfile();
      }
      throw error;
    }
  },
  
  updateProfile: (data: any, token: string) => 
    fetchAPI('/auth/profile', { method: 'PUT', body: JSON.stringify(data), token }),
};

// Products API with fallback to direct Supabase
export const productsAPI = {
  getAll: async (params?: { categoria?: string; busqueda?: string; orden?: string }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await fetchAPI(`/products${query ? `?${query}` : ''}`);
    } catch (error: any) {
      try {
        console.warn('Falling back to direct Supabase for products list');
        const { directProductsAPI } = await import('./supabase/direct');
        return await directProductsAPI.getAll(params);
      } catch (directError) {
        throw error;
      }
    }
  },
  
  getById: async (id: string) => {
    try {
      return await fetchAPI(`/products/${id}`);
    } catch (error: any) {
      try {
        console.warn('Falling back to direct Supabase for product by id');
        const { directProductsAPI } = await import('./supabase/direct');
        return await directProductsAPI.getById(id);
      } catch (directError) {
        throw error;
      }
    }
  },
  
  create: async (data: any, token: string) => {
    try {
      return await fetchAPI('/products', { method: 'POST', body: JSON.stringify(data), token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión') || error.message.includes('no disponible')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directProductsAPI } = await import('./supabase/direct');
        return await directProductsAPI.create(data);
      }
      throw error;
    }
  },
  
  update: (id: string, data: any, token: string) => 
    fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  
  delete: (id: string, token: string) => 
    fetchAPI(`/products/${id}`, { method: 'DELETE', token }),
  
  getMyProducts: async (token: string) => {
    try {
      return await fetchAPI('/products/vendor/my-products', { token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión') || error.message.includes('no disponible')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directProductsAPI } = await import('./supabase/direct');
        return await directProductsAPI.getMyProducts();
      }
      throw error;
    }
  },
};

// Categories API with fallback to direct Supabase
export const categoriesAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/categories');
    } catch (error: any) {
      try {
        console.warn('Falling back to direct Supabase for categories');
        const { directCategoriesAPI } = await import('./supabase/direct');
        return await directCategoriesAPI.getAll();
      } catch (directError) {
        throw error;
      }
    }
  },
  
  create: (data: any, token: string) => 
    fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data), token }),
  
  update: (id: string, data: any, token: string) => 
    fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
};

// Cart API with fallback to direct Supabase
export const cartAPI = {
  get: async (token: string) => {
    try {
      return await fetchAPI('/cart', { token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directCartAPI } = await import('./supabase/direct');
        return await directCartAPI.get();
      }
      throw error;
    }
  },
  
  addItem: async (data: { producto_id: string; cantidad: number }, token: string) => {
    try {
      return await fetchAPI('/cart/items', { method: 'POST', body: JSON.stringify(data), token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directCartAPI } = await import('./supabase/direct');
        return await directCartAPI.addItem(data.producto_id, data.cantidad);
      }
      throw error;
    }
  },
  
  updateItem: async (id: string, data: { cantidad: number }, token: string) => {
    try {
      return await fetchAPI(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify(data), token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directCartAPI } = await import('./supabase/direct');
        return await directCartAPI.updateItem(id, data.cantidad);
      }
      throw error;
    }
  },
  
  removeItem: async (id: string, token: string) => {
    try {
      return await fetchAPI(`/cart/items/${id}`, { method: 'DELETE', token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directCartAPI } = await import('./supabase/direct');
        return await directCartAPI.removeItem(id);
      }
      throw error;
    }
  },
  
  clear: async (token: string) => {
    try {
      return await fetchAPI('/cart/clear', { method: 'DELETE', token });
    } catch (error: any) {
      if (error.isConnectionError || error.message.includes('conexión')) {
        console.warn('Edge Function unavailable, using direct Supabase');
        const { directCartAPI } = await import('./supabase/direct');
        return await directCartAPI.clear();
      }
      throw error;
    }
  },
};

// Orders API
export const ordersAPI = {
  getAll: (token: string) => 
    fetchAPI('/orders', { token }),
  
  getById: (id: string, token: string) => 
    fetchAPI(`/orders/${id}`, { token }),
  
  create: (data: any, token: string) => 
    fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data), token }),
  
  updateStatus: (id: string, estado: string, token: string) => 
    fetchAPI(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ estado }), token }),
};

// Admin API
export const adminAPI = {
  getStats: (token: string) => 
    fetchAPI('/admin/stats', { token }),
  
  getUsers: (token: string) => 
    fetchAPI('/admin/users', { token }),
  
  getOrders: (params: { estado?: string; limite?: number }, token: string) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI(`/admin/orders${query ? `?${query}` : ''}`, { token });
  },
  
  updateUserRole: (userId: string, rol: string, token: string) => 
    fetchAPI(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ rol }), token }),
};
