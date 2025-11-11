import { useEffect, useState } from 'react';
import { ProductCard } from '../components/products/ProductCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { productsAPI, categoriesAPI } from '../utils/api';
import type { Product, Category } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Search } from 'lucide-react';

interface CatalogProps {
  onNavigate: (path: string) => void;
}

export function Catalog({ onNavigate }: CatalogProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState('reciente');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortOrder]);

  async function loadCategories() {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await productsAPI.getAll({
        categoria: selectedCategory || undefined,
        busqueda: searchQuery || undefined,
        orden: sortOrder
      });
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadProducts();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl">Catálogo de Productos</h1>
        <p className="text-muted-foreground">
          Explora todos los productos disponibles en Univalle Shop
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reciente">Más Recientes</SelectItem>
              <SelectItem value="precio_asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="precio_desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="nombre">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>

          {(selectedCategory || searchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                loadProducts();
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando productos...
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(id) => onNavigate(`/producto/${id}`)}
                onAddToCart={user ? (id) => addToCart(id, 1) : undefined}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">No se encontraron productos</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
              loadProducts();
            }}
          >
            Ver todos los productos
          </Button>
        </div>
      )}
    </div>
  );
}
