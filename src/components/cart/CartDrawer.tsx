import { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Checkbox } from '../ui/checkbox';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ShoppingCart, Trash2, Plus, Minus, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { CartItem } from '../../types';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (path: string) => void;
}

// Shimmer effect component
function ShimmerItem() {
  return (
    <div className="flex gap-4 p-4 border-b animate-pulse">
      <div className="w-20 h-20 bg-muted rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
    </div>
  );
}

export function CartDrawer({ open, onOpenChange, onNavigate }: CartDrawerProps) {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Select all items when cart loads
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      setSelectedItems(new Set(cart.items.map(item => item.id)));
    }
  }, [cart]);

  function handleToggleItem(itemId: string) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  }

  function handleSelectAll() {
    if (!cart) return;
    
    if (selectedItems.size === cart.items.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(cart.items.map(item => item.id)));
    }
  }

  function handleRemoveItem(itemId: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeItem(itemId);
    // Remove from selection
    const newSelected = new Set(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);
  }

  function handleUpdateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  }

  function handleCheckout() {
    if (selectedItems.size === 0) {
      toast.error('Selecciona al menos un producto para comprar');
      return;
    }
    onOpenChange(false);
    onNavigate('/checkout');
  }

  // Calculate total for selected items
  const selectedTotal = cart?.items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) || 0;

  const selectedCount = selectedItems.size;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mi Carrito
          </SheetTitle>
          <SheetDescription>
            {cart ? `${cart.cantidad_items} producto${cart.cantidad_items !== 1 ? 's' : ''} en tu carrito` : 'Tu carrito está vacío'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Select All */}
          {cart && cart.items.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.size === cart.items.length && cart.items.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label className="text-sm font-medium cursor-pointer">
                  Seleccionar todo ({selectedCount}/{cart.items.length})
                </label>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-2">
            {loading ? (
              // Shimmer effect while loading
              <>
                <ShimmerItem />
                <ShimmerItem />
                <ShimmerItem />
              </>
            ) : cart && cart.items.length > 0 ? (
              cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  selected={selectedItems.has(item.id)}
                  onToggleSelect={() => handleToggleItem(item.id)}
                  onRemove={(e) => handleRemoveItem(item.id, e)}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Agrega productos para comenzar
                </p>
                <Button onClick={() => { onOpenChange(false); onNavigate('/catalogo'); }}>
                  Ir al Catálogo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Summary */}
        {cart && cart.items.length > 0 && !loading && (
          <div className="mt-auto pt-6 border-t sticky bottom-0 bg-background">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
                </span>
                <span className="text-lg font-semibold">
                  Total: Bs. {selectedTotal.toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={selectedCount === 0}
              >
                <Check className="mr-2 h-5 w-5" />
                Comprar ({selectedCount})
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface CartItemCardProps {
  item: CartItem;
  selected: boolean;
  onToggleSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onUpdateQuantity: (quantity: number) => void;
}

function CartItemCard({ item, selected, onToggleSelect, onRemove, onUpdateQuantity }: CartItemCardProps) {
  return (
    <div className={`flex gap-4 p-4 border rounded-lg transition-colors ${selected ? 'bg-primary/5 border-primary' : ''}`}>
      <Checkbox
        checked={selected}
        onCheckedChange={onToggleSelect}
        className="mt-1"
      />
      
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <ImageWithFallback
          src={item.producto?.imagen_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
          alt={item.producto?.nombre || 'Producto'}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.producto?.nombre || 'Producto'}</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Bs. {item.precio_unitario.toFixed(2)} c/u
        </p>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.cantidad - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.cantidad + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

