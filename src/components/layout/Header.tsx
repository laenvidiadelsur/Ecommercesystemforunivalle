import { ShoppingCart, User, LogOut, Home, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

interface HeaderProps {
  onNavigate: (path: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { cart } = useCart();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('/')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span>UV</span>
          </div>
          <div>
            <div>Univalle Shop</div>
            <div className="text-xs text-muted-foreground">Universidad del Valle</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Inicio
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('/catalogo')}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Catálogo
          </Button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate('/carrito')}
            >
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.cantidad_items > 0 && (
                <Badge 
                  className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {cart.cantidad_items}
                </Badge>
              )}
            </Button>
          )}

          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>{user.nombre}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <Badge variant="outline" className="mt-1">{user.rol}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('/perfil')}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('/mis-ordenes')}>
                  <Package className="mr-2 h-4 w-4" />
                  Mis Órdenes
                </DropdownMenuItem>
                {(user.rol === 'vendedor' || user.rol === 'admin') && (
                  <DropdownMenuItem onClick={() => onNavigate('/vendedor')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Panel Vendedor
                  </DropdownMenuItem>
                )}
                {user.rol === 'admin' && (
                  <DropdownMenuItem onClick={() => onNavigate('/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Panel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onNavigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button onClick={() => onNavigate('/registro')}>
                Registrarse
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
