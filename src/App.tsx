import { useState, useEffect } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Catalog } from './pages/Catalog';
import { MyOrders } from './pages/MyOrders';
import { Vendor } from './pages/Vendor';
import { ProductDetail } from './pages/ProductDetail';
import { Profile } from './pages/Profile';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Cart } from './pages/Cart';

type Page = 
  | '/' 
  | '/login' 
  | '/registro' 
  | '/catalogo' 
  | '/mis-ordenes'
  | '/carrito'
  | '/producto/:id'
  | '/orden/:id'
  | '/vendedor'
  | '/admin'
  | '/perfil';

export default function App() {
  // Initialize from current URL pathname
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  function navigate(path: string) {
    setCurrentPage(path);
    window.scrollTo(0, 0);
    // Update URL without page reload
    window.history.pushState({}, '', path);
  }

  // Handle browser back/forward buttons and initial load
  useEffect(() => {
    // Set initial page from URL
    const initialPath = window.location.pathname || '/';
    if (initialPath !== currentPage) {
      setCurrentPage(initialPath);
    }

    function handlePopState() {
      setCurrentPage(window.location.pathname || '/');
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function renderPage() {
    // Simple routing based on current page
    if (currentPage === '/') {
      return <Home onNavigate={navigate} />;
    }
    
    if (currentPage === '/login') {
      return <Login onNavigate={navigate} />;
    }
    
    if (currentPage === '/registro') {
      return <Signup onNavigate={navigate} />;
    }
    
    if (currentPage === '/catalogo' || currentPage.startsWith('/catalogo?')) {
      return <Catalog onNavigate={navigate} />;
    }
    
    if (currentPage === '/mis-ordenes') {
      return <MyOrders onNavigate={navigate} />;
    }
    
    if (currentPage === '/vendedor') {
      return <Vendor onNavigate={navigate} />;
    }

    if (currentPage === '/perfil') {
      return <Profile onNavigate={navigate} />;
    }

    if (currentPage === '/carrito') {
      return <Cart onNavigate={navigate} />;
    }
    
    // Product detail page
    if (currentPage.startsWith('/producto/')) {
      const match = currentPage.match(/\/producto\/([^/]+)/);
      const productId = match ? match[1] : undefined;
      return <ProductDetail onNavigate={navigate} productId={productId} />;
    }
    
    // Checkout page (placeholder for now)
    if (currentPage === '/checkout') {
      return (
        <div className="container py-12 text-center">
          <h1 className="mb-4 text-3xl">Checkout</h1>
          <p className="text-muted-foreground mb-4">
            Página de checkout en desarrollo
          </p>
          <Button onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      );
    }
    
    // Placeholder for other pages
    return (
      <div className="container py-12 text-center">
        <h1 className="mb-4 text-3xl">Página en Construcción</h1>
        <p className="text-muted-foreground mb-4">
          Esta funcionalidad está en desarrollo
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-primary underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          {!(currentPage === '/login' || currentPage === '/registro') && (
            <Header onNavigate={navigate} minimal={false} />
          )}
          <main className="flex-1">
            {renderPage()}
          </main>
          {!(currentPage === '/login' || currentPage === '/registro') && (
            <Footer minimal={false} />
          )}
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
