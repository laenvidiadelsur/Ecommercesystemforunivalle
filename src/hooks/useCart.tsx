import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './useAuth';
import type { CartResponse, CartItem } from '../types';
import { toast } from 'sonner@2.0.3';

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  addToCart: (producto_id: string, cantidad?: number) => Promise<void>;
  updateQuantity: (itemId: string, cantidad: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Load cart when user is authenticated
  useEffect(() => {
    if (accessToken) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [accessToken]);

  async function refreshCart() {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const data = await cartAPI.get(accessToken);
      setCart(data);
    } catch (error: any) {
      console.error('Error loading cart:', error);
      // Try direct Supabase if Edge Function fails
      if (error.isConnectionError || error.message.includes('conexión') || error.message.includes('no disponible')) {
        try {
          const { directCartAPI } = await import('../utils/supabase/direct');
          const data = await directCartAPI.get();
          setCart(data);
        } catch (directError: any) {
          console.error('Error loading cart (direct):', directError);
          toast.error('Error al cargar el carrito');
        }
      } else {
        toast.error('Error al cargar el carrito');
      }
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(producto_id: string, cantidad: number = 1) {
    if (!accessToken) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    try {
      await cartAPI.addItem({ producto_id, cantidad }, accessToken);
      await refreshCart();
      toast.success('Producto agregado al carrito');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Error al agregar al carrito');
    }
  }

  async function updateQuantity(itemId: string, cantidad: number) {
    if (!accessToken) return;

    try {
      await cartAPI.updateItem(itemId, { cantidad }, accessToken);
      await refreshCart();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Error al actualizar cantidad');
    }
  }

  async function removeItem(itemId: string) {
    if (!accessToken) return;

    try {
      await cartAPI.removeItem(itemId, accessToken);
      await refreshCart();
      toast.success('Producto eliminado del carrito');
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast.error('Error al eliminar producto');
    }
  }

  async function clearCart() {
    if (!accessToken) return;

    try {
      await cartAPI.clear(accessToken);
      await refreshCart();
      toast.success('Carrito vaciado');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error('Error al vaciar carrito');
    }
  }

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      updateQuantity, 
      removeItem, 
      clearCart,
      refreshCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
