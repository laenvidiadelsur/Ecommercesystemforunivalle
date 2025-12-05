import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ordersAPI } from '../utils/api';
import { OrderCard } from '../components/orders/OrderCard';
import type { Order } from '../types';
import { Package } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Separator } from '../components/ui/separator';

interface MyOrdersProps {
  onNavigate: (path: string) => void;
}

export function MyOrders({ onNavigate }: MyOrdersProps) {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

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
              onViewDetails={() => { setSelected(order); setOpen(true); }}
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
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-8 shadow-2xl">
            {selected && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Orden {selected.numero_orden || selected.id}</div>
                  <div className="text-sm text-muted-foreground">{new Date(selected.created_at).toLocaleString('es-ES')}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Estado</div>
                    <div className="text-sm">{selected.estado}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-sm">Bs. {selected.total.toFixed(2)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Dirección</div>
                    <div className="text-sm">{selected.direccion_entrega}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Teléfono</div>
                    <div className="text-sm">{selected.telefono_contacto}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium">Productos</div>
                  <div className="space-y-3">
                    {(selected.items || []).map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-sm">
                        <div>{it.producto?.nombre || it.producto_id} × {it.cantidad}</div>
                        <div>Bs. {(it.cantidad * it.precio_unitario).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <Button onClick={() => { setOpen(false); onNavigate('/'); }}>Volver al inicio</Button>
                  <Button variant="outline" onClick={() => { setOpen(false); onNavigate('/catalogo'); }}>Seguir comprando</Button>
                  <Button variant="outline" onClick={() => { setOpen(false); onNavigate(`/orden/${selected.id}`); }}>Ver página de orden</Button>
                </div>
              </div>
            )}
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
