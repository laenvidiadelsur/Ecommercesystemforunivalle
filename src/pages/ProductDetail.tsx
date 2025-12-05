import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { productsAPI } from '../utils/api';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { ProductCard } from '../components/products/ProductCard';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '../components/ui/carousel';
import { Star, Heart } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';

interface ProductDetailProps {
  onNavigate: (path: string) => void;
  productId?: string;
}

export function ProductDetail({ onNavigate, productId }: ProductDetailProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [imageApi, setImageApi] = useState<CarouselApi | null>(null);
  const [relatedApi, setRelatedApi] = useState<CarouselApi | null>(null);
  const [imageHover, setImageHover] = useState(false);
  const [relatedHover, setRelatedHover] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError('Producto no encontrado');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await productsAPI.getById(productId);
        setProduct(data as Product);
        try {
          const prev = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          const item = { id: (data as any).id, nombre: (data as any).nombre, precio: (data as any).precio, imagen_url: (data as any).imagen_url };
          const next = [item, ...prev.filter((p: any) => p.id !== item.id)].slice(0, 6);
          localStorage.setItem('recentlyViewed', JSON.stringify(next));
        } catch {}
      } catch (e: any) {
        setError(e?.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  useEffect(() => {
    async function loadRelated() {
      if (!product || !product.categoria_id) {
        setRelated([]);
        return;
      }
      try {
        setRelatedLoading(true);
        const data = await productsAPI.getAll({ categoria: product.categoria_id, orden: 'reciente' });
        const list = (data as Product[]).filter(p => p.id !== product.id).slice(0, 8);
        setRelated(list);
      } catch (e: any) {
        setRelated([]);
      } finally {
        setRelatedLoading(false);
      }
    }
    loadRelated();
  }, [product]);

  useEffect(() => {
    if (!imageApi) return;
    const onSelect = () => setCurrentImageIndex(imageApi.selectedScrollSnap());
    onSelect();
    imageApi.on('select', onSelect);
    return () => {
      imageApi.off('select', onSelect);
    };
  }, [imageApi]);

  useEffect(() => {
    if (!imageApi) return;
    const interval = setInterval(() => {
      if (imageHover) return;
      if (imageApi.canScrollNext()) imageApi.scrollNext();
      else imageApi.scrollTo(0);
    }, 5000);
    return () => clearInterval(interval);
  }, [imageApi, imageHover]);

  useEffect(() => {
    if (!relatedApi) return;
    const interval = setInterval(() => {
      if (relatedHover) return;
      if (relatedApi.canScrollNext()) relatedApi.scrollNext();
      else relatedApi.scrollTo(0);
    }, 4500);
    return () => clearInterval(interval);
  }, [relatedApi, relatedHover]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product.id, quantity);
  }

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
  });
  const isWished = product ? wishlist.includes(product.id) : false;
  function toggleWishlist() {
    if (!product) return;
    const next = isWished ? wishlist.filter(id => id !== product.id) : [...wishlist, product.id];
    setWishlist(next);
    try { localStorage.setItem('wishlist', JSON.stringify(next)); } catch {}
  }

  const [reviews, setReviews] = useState<Array<{ nombre: string; rating: number; comentario: string }>>([
    { nombre: 'Ana', rating: 5, comentario: 'Excelente producto, llegó rápido.' },
    { nombre: 'Carlos', rating: 4, comentario: 'Buena relación calidad/precio.' },
  ]);
  const [newReview, setNewReview] = useState<{ nombre: string; rating: number; comentario: string }>({ nombre: '', rating: 5, comentario: '' });
  function addReview() {
    if (!newReview.nombre || !newReview.comentario) return;
    setReviews([...reviews, newReview]);
    setNewReview({ nombre: '', rating: 5, comentario: '' });
  }

  async function handleBuyNow() {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      onNavigate('/checkout');
    } catch {}
  }

  async function handleShare() {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  }

  return (
    <div className="py-10 md:py-12 lg:py-16" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
      <div className="mb-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); onNavigate('/'); }}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); onNavigate('/catalogo'); }}>Catálogo</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product?.nombre || 'Producto'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {loading ? (
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2">
          <Card className="overflow-hidden">
            <Skeleton className="w-full h-[400px]" />
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="w-24 h-24 rounded" />
                <Skeleton className="w-24 h-24 rounded" />
                <Skeleton className="w-24 h-24 rounded" />
              </div>
            </CardContent>
          </Card>
          <div>
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-20 w-full mb-6" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => onNavigate('/catalogo')}>Ir al catálogo</Button>
        </div>
      ) : product ? (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          <Card className="overflow-hidden">
            {(product.imagenes_adicionales && product.imagenes_adicionales.length > 0) ? (
              <div className="relative group" onMouseEnter={() => setImageHover(true)} onMouseLeave={() => setImageHover(false)}>
                <Carousel className="w-full" setApi={setImageApi}>
                  <CarouselContent className="flex">
                    {[product.imagen_url, ...product.imagenes_adicionales].filter(Boolean).map((url, idx) => (
                      <CarouselItem key={idx} className="basis-full">
                        <ImageWithFallback
                          src={url as string}
                          alt={`${product.nombre} ${idx + 1}`}
                          className="w-full h-[420px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CarouselPrevious className="left-3 bg-background/70 backdrop-blur shadow-md hover:bg-background size-10" />
                  <CarouselNext className="right-3 bg-background/70 backdrop-blur shadow-md hover:bg-background size-10" />
                </Carousel>
                <CardContent className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {[product.imagen_url, ...product.imagenes_adicionales].filter(Boolean).map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => imageApi?.scrollTo(idx)}
                        className={"rounded overflow-hidden border " + (currentImageIndex === idx ? 'border-primary' : 'border-transparent')}
                        aria-label={`Ver imagen ${idx + 1}`}
                      >
                        <ImageWithFallback
                          src={url as string}
                          alt={`${product.nombre} thumb ${idx + 1}`}
                          className="w-16 h-16 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </div>
            ) : (
              <div className="bg-muted">
                <ImageWithFallback
                  src={product.imagen_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200'}
                  alt={product.nombre}
                  className="w-full h-[420px] object-cover"
                />
                {!product.imagen_url && (
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Galería no disponible momentáneamente</div>
                  </CardContent>
                )}
              </div>
            )}
          </Card>

          <div>
            <h1 className="text-3xl font-semibold mb-2">{product.nombre}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">Bs. {product.precio.toFixed(2)}</Badge>
              {product.stock > 0 ? (
                <Badge variant="outline">Stock: {product.stock}</Badge>
              ) : (
                <Badge variant="destructive">Agotado</Badge>
              )}
              {product.categoria?.nombre && (
                <Badge variant="outline">{product.categoria.nombre}</Badge>
              )}
              <Button variant="ghost" size="icon" onClick={toggleWishlist} aria-label="Wishlist">
                <Heart className={"h-5 w-5 " + (isWished ? 'text-red-500' : 'text-muted-foreground')} />
              </Button>
            </div>

            {product.vendedor?.nombre && (
              <div className="text-sm text-muted-foreground mb-4">
                Vendedor: {product.vendedor.nombre}
              </div>
            )}

            {product.descripcion && (
              <p className="text-muted-foreground mb-6 whitespace-pre-line">{product.descripcion}</p>
            )}

            {!product.descripcion && (
              <p className="text-muted-foreground mb-6">Descripción no disponible momentáneamente</p>
            )}

            <div className="flex gap-3 mb-8">
              <Button variant="outline" onClick={handleShare}>Compartir</Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                >
                  −
                </Button>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, product.stock)}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || '1', 10);
                    setQuantity(Number.isNaN(v) ? 1 : Math.min(Math.max(1, v), Math.max(1, product.stock)));
                  }}
                  className="w-12 text-center outline-none bg-transparent"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Aumentar cantidad"
                >
                  +
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="min-w-40"
              >
                Agregar al carrito
              </Button>

              <Button
                variant="outline"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                Comprar ahora
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {!error && product && (
        <>
        <Separator className="my-10 md:my-12 lg:my-16 opacity-60" />
        <div className="mt-16 lg:mt-20">
          <h2 className="text-2xl mb-6">Productos relacionados</h2>
          {relatedLoading ? (
            <Carousel setApi={setRelatedApi}>
              <CarouselContent className="gap-4">
                {[0,1,2].map((i) => (
                  <CarouselItem key={i} className="basis-1/2 md:basis-1/3 lg:basis-1/3">
                    <Skeleton className="h-30 w-full" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3 bg-background/70 backdrop-blur shadow-md hover:bg-background" />
              <CarouselNext className="right-3 bg-background/70 backdrop-blur shadow-md hover:bg-background" />
            </Carousel>
          ) : related.length > 0 ? (
            <div onMouseEnter={() => setRelatedHover(true)} onMouseLeave={() => setRelatedHover(false)}>
              <Carousel setApi={setRelatedApi}>
                <CarouselContent>
                  {related.map((p) => (
                    <CarouselItem key={p.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <ProductCard
                        product={p}
                        onViewDetails={(id) => onNavigate(`/producto/${id}`)}
                        onAddToCart={user ? (id) => addToCart(id, 1) : undefined}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-3 bg-background/70 backdrop-blur shadow-md hover:bg-background" />
                <CarouselNext className="right-3 bg-background/70 backdrop-blur shadow-md hover:bg-background" />
              </Carousel>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay productos relacionados</div>
          )}
        </div>
        </>
      )}

      {!error && product && (
        <>
        <Separator className="my-10 md:my-12 lg:my-16 opacity-60" />
        <div className="mt-12 md:mt-16 lg:mt-20 grid gap-8 md:gap-10 lg:gap-12 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl mb-4">Reseñas</h2>
            <div className="space-y-3 mb-4">
              {reviews.map((r, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{r.nombre}</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, idx) => (<Star key={idx} className="h-4 w-4 text-yellow-500" />))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{r.comentario}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <Input placeholder="Tu nombre" value={newReview.nombre} onChange={(e) => setNewReview({ ...newReview, nombre: e.target.value })} />
              <Select value={String(newReview.rating)} onValueChange={(v: any) => setNewReview({ ...newReview, rating: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Calificación" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addReview}>Enviar reseña</Button>
            </div>
            <Textarea placeholder="Tu comentario" value={newReview.comentario} onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })} />
          </div>
          <div>
            <h2 className="text-2xl mb-4">Especificaciones</h2>
            {product.descripcion ? (
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {product.descripcion}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Especificaciones no disponibles momentáneamente</div>
            )}
            <h2 className="text-2xl mt-8 mb-4">Políticas de envío</h2>
            <div className="text-sm text-muted-foreground">Información de envío no disponible momentáneamente</div>
          </div>
        </div>
        </>
      )}

      {product && (
        <div className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-background/80 backdrop-blur border-t">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="font-medium">Bs. {product.precio.toFixed(2)}</div>
            <Button onClick={handleAddToCart} disabled={product.stock <= 0}>
              Agregar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
