import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7ff09ef6`;

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
    ...fetchOptions.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`API Error [${endpoint}]:`, data);
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
}

// Auth API
export const authAPI = {
  signup: (data: any, token?: string) => 
    fetchAPI('/auth/signup', { method: 'POST', body: JSON.stringify(data), token }),
  
  getProfile: (token: string) => 
    fetchAPI('/auth/profile', { token }),
  
  updateProfile: (data: any, token: string) => 
    fetchAPI('/auth/profile', { method: 'PUT', body: JSON.stringify(data), token }),
};

// Products API
export const productsAPI = {
  getAll: (params?: { categoria?: string; busqueda?: string; orden?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI(`/products${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => 
    fetchAPI(`/products/${id}`),
  
  create: (data: any, token: string) => 
    fetchAPI('/products', { method: 'POST', body: JSON.stringify(data), token }),
  
  update: (id: string, data: any, token: string) => 
    fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  
  delete: (id: string, token: string) => 
    fetchAPI(`/products/${id}`, { method: 'DELETE', token }),
  
  getMyProducts: (token: string) => 
    fetchAPI('/products/vendor/my-products', { token }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => fetchAPI('/categories'),
  
  create: (data: any, token: string) => 
    fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data), token }),
  
  update: (id: string, data: any, token: string) => 
    fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
};

// Cart API
export const cartAPI = {
  get: (token: string) => 
    fetchAPI('/cart', { token }),
  
  addItem: (data: { producto_id: string; cantidad: number }, token: string) => 
    fetchAPI('/cart/items', { method: 'POST', body: JSON.stringify(data), token }),
  
  updateItem: (id: string, data: { cantidad: number }, token: string) => 
    fetchAPI(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  
  removeItem: (id: string, token: string) => 
    fetchAPI(`/cart/items/${id}`, { method: 'DELETE', token }),
  
  clear: (token: string) => 
    fetchAPI('/cart/clear', { method: 'DELETE', token }),
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
