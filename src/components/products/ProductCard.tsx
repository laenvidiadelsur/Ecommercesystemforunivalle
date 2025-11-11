import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Product } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onViewDetails: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

export function ProductCard({ product, onViewDetails, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
      <div onClick={() => onViewDetails(product.id)}>
        <div className="aspect-square overflow-hidden bg-muted">
          <ImageWithFallback
            src={product.imagen_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
            alt={product.nombre}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate">{product.nombre}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {product.descripcion}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-2xl">Bs. {product.precio.toFixed(2)}</span>
            </div>
            {product.stock > 0 ? (
              <Badge variant="outline" className="text-xs">
                Stock: {product.stock}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Agotado
              </Badge>
            )}
          </div>

          {product.categoria && (
            <Badge variant="secondary" className="mt-2">
              {product.categoria.nombre}
            </Badge>
          )}
        </CardContent>
      </div>
      
      {onAddToCart && (
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full"
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Agregar al Carrito
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
