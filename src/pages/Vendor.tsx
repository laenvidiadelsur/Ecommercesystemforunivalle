import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { productsAPI, categoriesAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductCard } from '../components/products/ProductCard';
import { Plus, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Category, CreateProductRequest } from '../types';

interface VendorProps {
  onNavigate: (path: string) => void;
}

export function Vendor({ onNavigate }: VendorProps) {
  const { user, accessToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [formData, setFormData] = useState<CreateProductRequest>({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria_id: '',
    imagen_url: '',
    imagenes_adicionales: [],
  });

  useEffect(() => {
    if (!user || (user.rol !== 'vendedor' && user.rol !== 'admin')) {
      toast.error('No tienes permisos para acceder a esta sección');
      onNavigate('/');
      return;
    }

    loadCategories();
    loadMyProducts();
  }, [user]);

  async function loadCategories() {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data as Category[]);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar categorías');
    }
  }

  async function loadMyProducts() {
    if (!accessToken) return;
    
    try {
      setProductsLoading(true);
      const data = await productsAPI.getMyProducts(accessToken);
      setMyProducts(data as Product[]);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar tus productos');
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!accessToken) {
      toast.error('No estás autenticado');
      return;
    }

    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }

    if (formData.precio <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    if (formData.stock < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    if (!formData.categoria_id) {
      toast.error('Debes seleccionar una categoría');
      return;
    }

    try {
      setLoading(true);
      await productsAPI.create(formData, accessToken);
      toast.success('¡Producto creado exitosamente!');
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        categoria_id: '',
        imagen_url: '',
        imagenes_adicionales: [],
      });

      // Recargar productos
      await loadMyProducts();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  }

  if (!user || (user.rol !== 'vendedor' && user.rol !== 'admin')) {
    return null;
  }

  return (
    <div
      className="py-8"
      style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Vendedor</h1>
        <p className="text-muted-foreground">
          Gestiona tus productos y ventas
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Producto
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Mis Productos ({myProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Producto</CardTitle>
              <CardDescription>
                Completa el formulario para agregar un nuevo producto a tu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Producto *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Calculadora Científica"
                      required
                    />
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria_id}
                      onValueChange={(value: any) => setFormData({ ...formData, categoria_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Precio */}
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio (Bs.) *</Label>
                    <Input
                      id="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio || ''}
                      onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00 (Bolivianos)"
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Describe tu producto..."
                    rows={4}
                  />
                </div>

                {/* Imagen URL (Temporal) */}
                <div className="space-y-2">
                  <Label htmlFor="imagen_url">URL de Imagen (Temporal)</Label>
                  <Input
                    id="imagen_url"
                    type="url"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Temporal: usa una URL pública de imagen.
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Producto'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        nombre: '',
                        descripcion: '',
                        precio: 0,
                        stock: 0,
                        categoria_id: '',
                        imagen_url: '',
                        imagenes_adicionales: [],
                      });
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Mis Productos</h2>
              <Button onClick={() => loadMyProducts()}>
                Actualizar
              </Button>
            </div>

            {productsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando productos...</p>
              </div>
            ) : myProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No tienes productos aún</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primer producto usando el formulario de arriba
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => {}}
                    onViewDetails={() => onNavigate(`/producto/${product.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

