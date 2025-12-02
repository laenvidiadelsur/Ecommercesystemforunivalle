import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface ProfileProps {
  onNavigate: (path: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="mb-4 text-3xl">Perfil</h1>
        <p className="text-muted-foreground mb-4">Debes iniciar sesión para ver tu perfil</p>
        <Button onClick={() => onNavigate('/login')}>Iniciar Sesión</Button>
      </div>
    );
  }

  return (
    <div className="py-8" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
        <p className="text-muted-foreground">Información de tu cuenta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
            <CardDescription>Nombre, correo y rol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Nombre</div>
                <div className="text-lg font-medium">{user.nombre}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Correo</div>
                <div className="text-lg font-medium">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rol</div>
                <Badge variant="outline">{user.rol}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>Accesos rápidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" onClick={() => onNavigate('/mis-ordenes')}>Ver Mis Órdenes</Button>
              {(user.rol === 'vendedor' || user.rol === 'admin') && (
                <Button onClick={() => onNavigate('/vendedor')}>Ir al Panel de Vendedor</Button>
              )}
              {user.rol === 'admin' && (
                <Button variant="ghost" onClick={() => onNavigate('/admin')}>Ir al Panel Admin</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
