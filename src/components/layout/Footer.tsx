export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div>Univalle Shop</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Plataforma de venta de productos para la comunidad de la Universidad del Valle
            </p>
          </div>
          
          <div>
            <div>Enlaces</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Acerca de</li>
              <li>Términos y Condiciones</li>
              <li>Política de Privacidad</li>
              <li>Contacto</li>
            </ul>
          </div>
          
          <div>
            <div>Soporte</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Centro de Ayuda</li>
              <li>Preguntas Frecuentes</li>
              <li>Cómo Vender</li>
              <li>Cómo Comprar</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Universidad del Valle. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
