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
import { Toaster } from './components/ui/sonner';

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
  const [currentPage, setCurrentPage] = useState<string>('/');

  function navigate(path: string) {
    setCurrentPage(path);
    window.scrollTo(0, 0);
  }

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
          <Header onNavigate={navigate} />
          <main className="flex-1">
            {renderPage()}
          </main>
          <Footer />
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
