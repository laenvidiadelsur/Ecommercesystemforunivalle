import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/products/ProductCard';
import { productsAPI, categoriesAPI } from '../utils/api';
import type { Product, Category } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, ShoppingBag } from 'lucide-react';
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

  useEffect(() => {
    loadData();
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
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container relative z-10 grid gap-8 py-20 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl">
              Bienvenido a Univalle Shop
            </h1>
            <p className="text-lg text-primary-foreground/90">
              El marketplace oficial de la Universidad del Valle. Compra y vende productos entre estudiantes y la comunidad universitaria.
            </p>
            <div className="flex flex-wrap gap-4">
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
          <div className="hidden items-center justify-center md:flex">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600"
              alt="Universidad"
              className="rounded-lg shadow-2xl"
              style={{ maxWidth: '500px', width: '100%' }}
            />
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
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="text-center text-sm">{category.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(id) => onNavigate(`/producto/${id}`)}
                onAddToCart={user ? (id) => addToCart(id, 1) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay productos disponibles
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container">
          <div className="rounded-2xl bg-muted p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl">¿Quieres vender tus productos?</h2>
            <p className="mb-6 text-muted-foreground">
              Únete a nuestra comunidad de vendedores y comienza a vender tus productos hoy mismo
            </p>
            <Button size="lg" onClick={() => onNavigate('/registro')}>
              Registrarse Ahora
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
