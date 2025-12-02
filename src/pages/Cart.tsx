import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ShoppingCart, Trash2, Plus, Minus, Check } from 'lucide-react';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export function Cart({ onNavigate }: CartPageProps) {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();

  const selectedCount = cart?.items.length || 0;
  const total = cart?.items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0) || 0;

  return (
    <div className="py-10 md:py-12 lg:py-16" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      <div className="mb-8 md:mb-10 lg:mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Mi Carrito</h1>
          <p className="text-muted-foreground">{cart ? `${cart.cantidad_items} producto${cart.cantidad_items !== 1 ? 's' : ''}` : 'Sin productos'}</p>
        </div>
        {cart && cart.items.length > 0 && (
          <Button variant="outline" onClick={clearCart}>Vaciar Carrito</Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Cargando carrito...</p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-6">Explora el catálogo y agrega productos</p>
            <Button onClick={() => onNavigate('/catalogo')}>Ir al Catálogo</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Revisa los productos antes de comprar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cart.items.map((item, index) => (
                  <div key={item.id}>
                    <div className="grid grid-cols-[96px_1fr] md:grid-cols-[120px_1fr] gap-4 md:gap-6 items-start">
                      <div className="w-24 h-24 md:w-30 md:h-30 rounded-lg overflow-hidden bg-muted">
                        <ImageWithFallback
                          src={item.producto?.imagen_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                          alt={item.producto?.nombre || 'Producto'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-base md:text-lg font-semibold leading-tight">{item.producto?.nombre || 'Producto'}</h4>
                          <Badge variant="outline">Bs. {item.precio_unitario.toFixed(2)} c/u</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.cantidad - 1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">{item.cantidad}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.cantidad + 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm md:text-base font-semibold">Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < cart.items.length - 1 && <Separator className="my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
                <CardDescription>
                  {selectedCount} producto{selectedCount !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-semibold">Bs. {total.toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => onNavigate('/checkout')}>
                  <Check className="mr-2 h-5 w-5" />
                  Comprar
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => onNavigate('/catalogo')}>Seguir comprando</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
                <CardDescription>Entrega y soporte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>La entrega y tiempos pueden variar según el vendedor.</div>
                <div>Revisa las políticas de devolución antes de comprar.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
