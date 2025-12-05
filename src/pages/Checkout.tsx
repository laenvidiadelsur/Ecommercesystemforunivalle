import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ordersAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Checkbox } from '../components/ui/checkbox';
import type { Order } from '../types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';

interface CheckoutProps {
  onNavigate: (path: string) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const { user, accessToken } = useAuth();
  const { cart, loading, clearCart, refreshCart } = useCart();

  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [payment, setPayment] = useState<'tarjeta' | 'qr' | 'efectivo'>('qr');
  const [delivery, setDelivery] = useState<'domicilio' | 'retiro'>('domicilio');
  const [invoice, setInvoice] = useState(false);

  useEffect(() => {
    if (user) {
      setDireccion(user.direccion || '');
      setTelefono(user.telefono || '');
    }
  }, [user]);

  const subtotal = useMemo(() => {
    return cart?.items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0) || 0;
  }, [cart]);
  const shippingCost = delivery === 'domicilio' ? 20 : 0;
  const total = subtotal + shippingCost;

  async function handleConfirmPurchase() {
    setErrorMsg(null);
    if (!accessToken) {
      setErrorMsg('Debes iniciar sesión para completar la compra.');
      return;
    }
    if (!cart || cart.items.length === 0) {
      setErrorMsg('Tu carrito está vacío.');
      return;
    }
    if (!direccion || direccion.length < 6) {
      setErrorMsg('Ingresa una dirección válida.');
      return;
    }
    if (!telefono || telefono.length < 6) {
      setErrorMsg('Ingresa un teléfono válido.');
      return;
    }

    try {
      setProcessing(true);
      const order = await ordersAPI.create({
        direccion_entrega: direccion,
        telefono_contacto: telefono,
        notas: notas || undefined,
      }, accessToken) as Order;

      await clearCart();
      await refreshCart();
      void order;
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al crear la orden.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="py-10 md:py-12 lg:py-16" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      <div className="mb-8 md:mb-10 lg:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Confirma tu compra y datos de entrega</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Cargando carrito...</p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
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
                <CardTitle>Datos de Entrega</CardTitle>
                <CardDescription>Usa tu información o edítala</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de entrega</label>
                  <Select value={delivery} onValueChange={(v: any) => setDelivery(v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domicilio">Entrega a domicilio (Bs. 20)</SelectItem>
                      <SelectItem value="retiro">Retiro en punto (Bs. 0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dirección</label>
                  <Textarea value={direccion} onChange={(e: any) => setDireccion(e.target.value)} placeholder="Calle Principal #123, Zona Central" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input value={telefono} onChange={(e: any) => setTelefono(e.target.value)} placeholder="70000000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas (opcional)</label>
                  <Textarea value={notas} onChange={(e: any) => setNotas(e.target.value)} placeholder="Instrucciones de entrega" />
                </div>
                {errorMsg && (
                  <div className="text-destructive text-sm">{errorMsg}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Resumen de tu carrito</CardDescription>
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
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-base md:text-lg font-semibold leading-tight">{item.producto?.nombre || 'Producto'}</h4>
                          <span className="text-sm">Bs. {item.precio_unitario.toFixed(2)} c/u</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Cantidad: {item.cantidad}</span>
                          <span className="text-sm md:text-base font-semibold">Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
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
                <CardDescription>{cart.items.length} producto{cart.items.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de pago</label>
                  <Select value={payment} onValueChange={(v: any) => setPayment(v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qr">QR / Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={invoice} onCheckedChange={(v: any) => setInvoice(!!v)} />
                  <span className="text-sm">Requerir factura</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm">Bs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Envío</span>
                  <span className="text-sm">Bs. {shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-semibold">Bs. {total.toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" disabled={processing} onClick={handleConfirmPurchase}>
                  {processing ? 'Procesando...' : 'Confirmar Compra'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => onNavigate('/carrito')}>Volver al carrito</Button>
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
