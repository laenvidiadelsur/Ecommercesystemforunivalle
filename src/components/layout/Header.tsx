import { useState } from 'react';
import { ShoppingCart, ShoppingBag, User, LogOut, Search, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Input } from '../ui/input';
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
import { CartDrawer } from '../cart/CartDrawer';
import { toast } from 'sonner';

interface HeaderProps {
  onNavigate: (path: string) => void;
  minimal?: boolean;
}

export function Header({ onNavigate, minimal }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      // Asegurar redirección al inicio
      setTimeout(() => {
        onNavigate('/');
        // También forzar scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Error al cerrar sesión');
      // Redirigir al inicio incluso si hay error
      onNavigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden">
      <div
        className="flex w-full items-center"
        style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px', height: '80px' }}
      >
        {/* Logo */}
        <div 
          className="flex items-center gap-4 cursor-pointer" 
          onClick={() => onNavigate('/')}
          aria-label="E-commerce System for Univalle"
        >
          <ShoppingBag className="h-10 w-10 ml-2" style={{ color: '#522b46' }} />
          <div className="leading-tight">
            <div className="text-lg font-semibold ml-2" style={{ color: '#522b46' }}>E-commerce System for Univalle</div>
          </div>
        </div>

        {/* Navigation simplified: center search and categorías */}
        <nav className="flex flex-1 min-w-0 items-center justify-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.querySelector('#nav-search') as HTMLInputElement) || null;
              const q = input?.value?.trim();
              onNavigate(q ? `/catalogo?busqueda=${encodeURIComponent(q)}` : '/catalogo');
            }}
            className="hidden md:flex items-center gap-2"
          >
            <div className="relative w-[320px] max-w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="nav-search" placeholder="Buscar productos..." className="pl-10" />
            </div>
            <Button type="submit" variant="ghost" style={{ color: '#522b46' }}>Buscar</Button>
          </form>
          <Button variant="ghost" onClick={() => onNavigate('/catalogo')} style={{ color: '#522b46' }}>
            Categorías
          </Button>
          {!minimal && (user?.rol === 'vendedor' || user?.rol === 'admin') && (
            <Button variant="outline" onClick={() => onNavigate('/vendedor')} className="hidden sm:flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Vender
            </Button>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label={darkMode ? 'Tema oscuro activado' : 'Tema claro activado'} onClick={toggleTheme}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {!minimal && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrito"
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
              <CartDrawer 
                open={cartOpen} 
                onOpenChange={setCartOpen}
                onNavigate={onNavigate}
              />
            </>
          )}

          {!minimal && (
            user ? (
              <div className="flex items-center gap-2">
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
                      {/* reusing Package icon removed earlier; use LayoutDashboard as placeholder */}
                      <LayoutDashboard className="mr-2 h-4 w-4" />
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
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </div>
            ) : (
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" onClick={() => onNavigate('/login')} style={{ color: '#522b46' }}>
                  Iniciar Sesión
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
