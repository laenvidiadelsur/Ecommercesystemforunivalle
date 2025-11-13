import { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ShoppingCart, ArrowLeft, Package, User, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../types';

interface ProductDetailProps {
  onNavigate: (path: string) => void;
  productId?: string;
}

export function ProductDetail({ onNavigate, productId: propProductId }: ProductDetailProps) {
  const [productId, setProductId] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    // Extract product ID from URL or prop
    let id = propProductId;
    
    if (!id) {
      const path = window.location.pathname;
      const match = path.match(/\/producto\/([^/]+)/);
      if (match) {
        id = match[1];
      }
    }
    
    if (id) {
      setProductId(id);
      loadProduct(id);
    } else {
      setLoading(false);
      toast.error('Producto no encontrado');
    }
  }, [propProductId]);

  async function loadProduct(id: string) {
    try {
      setLoading(true);
      const data = await productsAPI.getById(id);
      setProduct(data as Product);
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!user) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      onNavigate('/login');
      return;
    }

    if (!product) return;

    if (product.stock < quantity) {
      toast.error(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    addToCart(product.id, quantity);
    toast.success('Producto agregado al carrito');
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Producto no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              El producto que buscas no existe o ha sido eliminado
            </p>
            <Button onClick={() => onNavigate('/catalogo')}>
              Volver al Catálogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => onNavigate('/catalogo')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Catálogo
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <ImageWithFallback
              src={product.imagen_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.nombre}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Additional images if available */}
          {product.imagenes_adicionales && product.imagenes_adicionales.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.imagenes_adicionales.map((img, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <ImageWithFallback
                    src={img}
                    alt={`${product.nombre} - Imagen ${index + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{product.nombre}</h1>
            
            {product.categoria && (
              <Badge variant="secondary" className="mb-4">
                {product.categoria.nombre}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
            <span className="text-4xl font-bold">Bs. {product.precio.toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-lg">
                Stock disponible: <strong>{product.stock}</strong> unidades
              </span>
            ) : (
              <Badge variant="destructive" className="text-lg">
                Agotado
              </Badge>
            )}
          </div>

          {/* Description */}
          {product.descripcion && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.descripcion}
              </p>
            </div>
          )}

          {/* Vendor Info */}
          {product.vendedor && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-5 w-5" />
              <span>Vendedor: <strong>{product.vendedor.nombre}</strong></span>
            </div>
          )}

          {/* Add to Cart Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {product.stock > 0 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.max(1, Math.min(val, product.stock)));
                          }}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                        >
                          +
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          de {product.stock} disponibles
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={!user}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {user ? 'Agregar al Carrito' : 'Inicia Sesión para Comprar'}
                    </Button>

                    {!user && (
                      <p className="text-sm text-center text-muted-foreground">
                        <button
                          onClick={() => onNavigate('/login')}
                          className="text-primary underline"
                        >
                          Inicia sesión
                        </button>
                        {' '}para agregar productos al carrito
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Badge variant="destructive" className="mb-4">
                      Producto Agotado
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Este producto no está disponible en este momento
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

