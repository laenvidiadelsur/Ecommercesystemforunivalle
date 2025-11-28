import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ordersAPI } from '../utils/api';
import { OrderCard } from '../components/orders/OrderCard';
import type { Order } from '../types';
import { Package } from 'lucide-react';

interface MyOrdersProps {
  onNavigate: (path: string) => void;
}

export function MyOrders({ onNavigate }: MyOrdersProps) {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      loadOrders();
    }
  }, [accessToken]);

  async function loadOrders() {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const data = await ordersAPI.getAll(accessToken);
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        className="py-8"
        style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}
      >
        <div className="text-center py-12 text-muted-foreground">
          Cargando órdenes...
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-8"
      style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}
    >
      <div className="mb-8">
        <h1 className="mb-2 text-4xl">Mis Órdenes</h1>
        <p className="text-muted-foreground">
          Historial de tus compras y su estado
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={(id) => onNavigate(`/orden/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-2">No tienes órdenes todavía</p>
          <p className="text-sm text-muted-foreground">
            Comienza a explorar productos y realiza tu primera compra
          </p>
        </div>
      )}
    </div>
  );
}
