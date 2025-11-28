import { ShoppingBag, Mail, Phone } from 'lucide-react';

interface FooterProps { minimal?: boolean }

export function Footer({ minimal }: FooterProps) {
  return (
    <footer className="border-t bg-background shadow-inner justify-center justify-items-center">
      <div
        className="py-8"
        style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}
      >
        {!minimal && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" style={{ color: '#522b46' }} />
                <span className="font-semibold" style={{ color: '#522b46' }}>E-commerce System for Univalle</span>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <a href="/" className="hover:underline">Inicio</a>
                <a href="/catalogo" className="hover:underline">Catálogo</a>
                <a href="#" className="hover:underline">Términos</a>
                <a href="#" className="hover:underline">Privacidad</a>
                <a href="/perfil" className="hover:underline">Contacto</a>
              </nav>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> univalle@support.edu</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +591 700 00000</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Universidad del Valle. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
