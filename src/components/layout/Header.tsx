import { useState } from 'react';
import { ShoppingCart, ShoppingBag, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
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
// removed CartDrawer usage; cart button now only ofrece "Ver Carrito"
import { toast } from 'sonner';

interface HeaderProps {
  onNavigate: (path: string) => void;
  minimal?: boolean;
}

export function Header({ onNavigate, minimal }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
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
          aria-label="Unimarket"
        >
          <ShoppingBag className="h-10 w-10 ml-2" style={{ color: '#522b46' }} />
          <div className="leading-tight">
            <div className="text-lg font-semibold ml-2" style={{ color: '#522b46' }}>Unimarket</div>
          </div>
        </div>

        <nav className="flex flex-1 min-w-0 items-center justify-center gap-4 md:gap-6 lg:gap-8">
          <Button variant="ghost" onClick={() => onNavigate('/')} style={{ color: '#522b46' }}>
            Inicio
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('/catalogo')} style={{ color: '#522b46' }}>
            Catálogo
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('/catalogo?orden=reciente')} style={{ color: '#522b46' }}>
            Ofertas
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('/mis-ordenes')} style={{ color: '#522b46' }}>
            Mis Órdenes
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('/perfil')} style={{ color: '#522b46' }}>
            Ayuda
          </Button>
          {(user?.rol === 'vendedor' || user?.rol === 'admin') && (
            <Button variant="outline" onClick={() => onNavigate('/vendedor')} className="hidden sm:flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Vender Producto
            </Button>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-5 md:gap-6">
          <Button variant="ghost" size="icon" aria-label={darkMode ? 'Tema oscuro activado' : 'Tema claro activado'} onClick={toggleTheme}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Abrir carrito">
                <ShoppingCart className="h-5 w-5" />
                {cart && cart.cantidad_items > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs" variant="destructive">
                    {cart.cantidad_items}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {cart ? `${cart.cantidad_items} producto${cart.cantidad_items !== 1 ? 's' : ''}` : 'Tu carrito'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('/carrito')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Ver Carrito
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          

          {user ? (
              <div className="flex items-center gap-2">
                <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setProfileOpen(true)} aria-label="Abrir menú de perfil">
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
                    <DropdownMenuItem onClick={() => { setProfileOpen(false); onNavigate('/perfil'); }}>
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setProfileOpen(false); onNavigate('/mis-ordenes'); }}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Mis Órdenes
                    </DropdownMenuItem>
                    {(user.rol === 'vendedor' || user.rol === 'admin') && (
                      <DropdownMenuItem onClick={() => { setProfileOpen(false); onNavigate('/vendedor'); }}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Panel Vendedor
                      </DropdownMenuItem>
                    )}
                    {user.rol === 'admin' && (
                      <DropdownMenuItem onClick={() => { setProfileOpen(false); onNavigate('/admin'); }}>
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
            )}
        </div>
      </div>
    </header>
  );
}
