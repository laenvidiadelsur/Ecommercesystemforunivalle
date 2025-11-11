import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Order, OrderStatus } from '../../types';
import { Package } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onViewDetails: (id: string) => void;
}

const statusConfig: Record<OrderStatus, { label: string; variant: any }> = {
  pendiente: { label: 'Pendiente', variant: 'default' },
  confirmada: { label: 'Confirmada', variant: 'default' },
  enviada: { label: 'Enviada', variant: 'default' },
  entregada: { label: 'Entregada', variant: 'default' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
};

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const config = statusConfig[order.estado];
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm">{order.numero_orden}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span>Bs. {order.total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dirección</span>
            <span className="max-w-[200px] truncate text-right">
              {order.direccion_entrega}
            </span>
          </div>

          {order.items && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Productos</span>
              <span>{order.items.length}</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => onViewDetails(order.id)}
          >
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
