import { useEffect, useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/products/ProductCard';
import { productsAPI, categoriesAPI } from '../utils/api';
import type { Product, Category } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Palette,
  Dumbbell,
  Cpu,
  Home as HomeIcon,
  Book,
  BookOpen,
  Package,
  Pencil,
  Tag,
  Wrench,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [recently, setRecently] = useState<Array<{ id: string; nombre: string; precio: number; imagen_url?: string }>>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  function scrollCarousel(direction: 'left' | 'right') {
    const container = carouselRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.25 + 16;
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  function getCategoryIcon(name: string) {
    const n = (name || '').toLowerCase();
    if (n.includes('aliment') || n.includes('comida')) return <Utensils className="h-6 w-6" />;
    if (n.includes('arte') || n.includes('manual')) return <Palette className="h-6 w-6" />;
    if (n.includes('deporte')) return <Dumbbell className="h-6 w-6" />;
    if (n.includes('electr') || n.includes('tecno')) return <Cpu className="h-6 w-6" />;
    if (n.includes('hogar') || n.includes('decor')) return <HomeIcon className="h-6 w-6" />;
    if (n.includes('libros') && n.includes('acad')) return <BookOpen className="h-6 w-6" />;
    if (n.includes('libro')) return <Book className="h-6 w-6" />;
    if (n.includes('papel')) return <Pencil className="h-6 w-6" />;
    if (n.includes('ropa')) return <Tag className="h-6 w-6" />;
    if (n.includes('servicio')) return <Wrench className="h-6 w-6" />;
    if (n.includes('otros')) return <Package className="h-6 w-6" />;
    return <ShoppingBag className="h-6 w-6" />;
  }

  useEffect(() => {
    loadData();
    try {
      const prev = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecently(Array.isArray(prev) ? prev : []);
    } catch {
      setRecently([]);
    }
  }, []);

  async function loadData() {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAll({ orden: 'reciente' }),
        categoriesAPI.getAll()
      ]);
      setProducts((productsData as Product[]).slice(0, 6));
      setCategories(categoriesData as Category[]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-12 py-12"
      style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}
    >
      {/* Hero Section */}
      <section
        className="relative overflow-hidden rounded-2xl text-white"
        style={{
          marginTop: '70px',
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('https://th.bing.com/th/id/R.e85fd6285b76588a62296b19900b121d?rik=hZD%2faQPGzI5zKQ&pid=ImgRaw&r=0')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '52vh'
        }}
      >
        <div className="container relative z-10 grid gap-12 md:grid-cols-2 items-start justify-items-start" style={{ paddingTop: 130, paddingBottom: 56 }}>
          <div className="flex flex-col items-center justify-center gap-6 text-center mt-12 md:mt-16" style={{ maxWidth: 900 }}>
            <h1 className="text-2xl md:text-5xl lg:text-5xl mt-8">
              Bienvenido a Unimarket
            </h1>
            <p className="text-md text-primary-foreground/90 ml-3">
              El marketplace oficial de la comunidad. Compra y vende productos de forma fácil.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => onNavigate('/catalogo')}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explorar Productos
              </Button>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => onNavigate('/registro')}
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  Comenzar a Vender
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
        </div>
      </section>

      {/* Categories */}
      <section className="container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl">Categorías</h2>
            <p className="text-muted-foreground">Explora por categoría</p>
          </div>
        </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNavigate(`/catalogo?categoria=${category.id}`)}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted"
              >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {getCategoryIcon(category.nombre)}
              </div>
              <span className="text-center text-sm">{category.nombre}</span>
              </button>
            ))}
          </div>
      </section>

      {/* Featured Products */}
      <section className="container mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl">Productos Recientes</h2>
            <p className="text-muted-foreground">Descubre lo más nuevo</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate('/catalogo')}>
            Ver Todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando productos...</div>
        ) : products.length > 0 ? (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollCarousel('left')}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={carouselRef}
              className="no-scrollbar flex-1"
              style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
            >
              {products.map((product) => (
                <div key={product.id} style={{ flex: '0 0 25%', minWidth: '25%', maxWidth: '25%', scrollSnapAlign: 'start' }}>
                  <ProductCard
                    product={product}
                    onViewDetails={(id) => onNavigate(`/producto/${id}`)}
                    onAddToCart={user ? (id) => addToCart(id, 1) : undefined}
                  />
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollCarousel('right')}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay productos disponibles
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      {recently.length > 0 && (
        <section className="container mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl">Vistos recientemente</h2>
              <p className="text-muted-foreground">Continúa donde lo dejaste</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recently.map((p) => (
              <button
                key={p.id}
                onClick={() => onNavigate(`/producto/${p.id}`)}
                className="rounded-lg border overflow-hidden text-left"
                aria-label={p.nombre}
              >
                <ImageWithFallback
                  src={p.imagen_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                  alt={p.nombre}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{p.nombre}</div>
                  <div className="text-sm text-muted-foreground">Bs. {Number(p.precio).toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

     
    </div>
  );
}
