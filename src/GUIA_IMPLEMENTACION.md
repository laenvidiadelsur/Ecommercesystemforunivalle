# 🚀 Guía de Implementación - Univalle Shop

## 📋 Pasos para Implementación Completa

### 1. Configuración de Supabase Database

**Paso 1.1: Ejecutar el Schema SQL**

1. Ve a tu Dashboard de Supabase
2. Navega a `SQL Editor`
3. Crea una nueva query
4. Copia y pega todo el contenido de la sección "Esquema SQL" del archivo `ARQUITECTURA.md`
5. Ejecuta el script completo
6. Verifica que se hayan creado todas las tablas:
   - user_profiles
   - categories
   - products
   - carts
   - cart_items
   - orders
   - order_items

**Paso 1.2: Verificar RLS (Row Level Security)**

1. En Supabase Dashboard, ve a `Authentication` > `Policies`
2. Verifica que todas las políticas RLS estén habilitadas para cada tabla
3. Las políticas ya están definidas en el script SQL

### 2. Configuración de Authentication

**Paso 2.1: Habilitar Email/Password**

1. En Supabase Dashboard, ve a `Authentication` > `Providers`
2. Asegúrate de que `Email` esté habilitado
3. Configura las opciones:
   - ✅ Enable Email provider
   - ✅ Confirm email: **Deshabilitado** (para desarrollo)
   - En producción, configura un servidor SMTP

**Paso 2.2: Configurar URLs de Redirección**

1. Ve a `Authentication` > `URL Configuration`
2. Agrega las URLs permitidas según tu entorno

### 3. Configuración de Storage (Opcional para Imágenes)

**Paso 3.1: Crear Bucket**

1. Ve a `Storage` en Supabase Dashboard
2. Crea un nuevo bucket: `make-7ff09ef6-product-images`
3. Configura como **privado**
4. El servidor manejará las signed URLs automáticamente

**Paso 3.2: Políticas de Storage**

```sql
-- Permitir a vendedores subir imágenes
CREATE POLICY "Vendedores pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-7ff09ef6-product-images' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND rol IN ('vendedor', 'admin')
  )
);

-- Permitir a todos ver imágenes (con signed URLs)
CREATE POLICY "Todos pueden ver imágenes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'make-7ff09ef6-product-images');
```

### 4. Variables de Entorno

Las siguientes variables ya están configuradas automáticamente en el servidor:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

### 5. Testing del Sistema

**Paso 5.1: Crear Usuario Admin**

Ejecuta este SQL en Supabase SQL Editor para crear un admin:

```sql
-- Primero, registra un usuario desde la aplicación
-- Luego, actualiza su rol a admin:

UPDATE public.user_profiles
SET rol = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

**Paso 5.2: Flujo de Testing Completo**

1. **Registro de Usuario**
   - Ir a `/registro`
   - Crear cuenta como "estudiante"
   - Verificar que se crea el perfil

2. **Crear Vendedor**
   - Crear otra cuenta con rol "vendedor"
   - Login con esa cuenta

3. **Crear Producto** (como vendedor)
   - Acceder al panel de vendedor
   - Crear un producto de prueba
   - Verificar que aparece en el catálogo

4. **Proceso de Compra** (como estudiante)
   - Buscar productos en el catálogo
   - Agregar al carrito
   - Proceder al checkout
   - Completar la orden

5. **Gestión Admin**
   - Login como admin
   - Ver estadísticas
   - Gestionar usuarios y órdenes

### 6. Datos de Prueba (Seed Data)

El script SQL ya incluye las categorías por defecto:
- Libros
- Electrónica
- Papelería
- Ropa
- Comida
- Otros

Para agregar productos de prueba, puedes ejecutar:

```sql
-- Ejemplo: Insertar producto de prueba
INSERT INTO public.products (
  nombre, 
  descripcion, 
  precio, 
  stock, 
  categoria_id, 
  vendedor_id,
  activo
) VALUES (
  'Calculadora Científica',
  'Calculadora científica Casio FX-991',
  150.00,
  10,
  (SELECT id FROM categories WHERE nombre = 'Electrónica' LIMIT 1),
  (SELECT id FROM user_profiles WHERE rol = 'vendedor' LIMIT 1),
  true
);
```

## 📱 Estructura de la Aplicación

### Páginas Implementadas

✅ **Landing/Home** (`/`)
- Hero section
- Categorías destacadas
- Productos recientes
- CTAs para registro

✅ **Login** (`/login`)
- Formulario de inicio de sesión
- Manejo de errores
- Redirección post-login

✅ **Registro** (`/registro`)
- Formulario completo de registro
- Selección de rol (estudiante/vendedor)
- Validación de datos

✅ **Catálogo** (`/catalogo`)
- Grid de productos
- Filtros por categoría
- Búsqueda
- Ordenamiento

✅ **Mis Órdenes** (`/mis-ordenes`)
- Historial de compras
- Estados de órdenes
- Vista detallada

### Páginas Pendientes (Placeholder)

🚧 **Detalle de Producto** (`/producto/:id`)
🚧 **Carrito** (`/carrito`)
🚧 **Checkout** (`/checkout`)
🚧 **Detalle de Orden** (`/orden/:id`)
🚧 **Panel Vendedor** (`/vendedor`)
🚧 **Panel Admin** (`/admin`)
🚧 **Perfil de Usuario** (`/perfil`)

## 🔧 Personalización y Extensión

### Agregar Nueva Página

1. Crear el componente en `/pages/NombrePagina.tsx`
2. Importar en `/App.tsx`
3. Agregar ruta en la función `renderPage()`
4. Agregar navegación en el Header si es necesario

### Agregar Nuevo Endpoint en el Backend

1. Crear o editar archivo en `/supabase/functions/server/routes/`
2. Definir las rutas usando Hono
3. Importar y montar en `/supabase/functions/server/index.tsx`

### Agregar Nueva Tabla en la Base de Datos

1. Crear tabla con `CREATE TABLE` en SQL Editor
2. Habilitar RLS: `ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;`
3. Crear políticas RLS apropiadas
4. Actualizar tipos en `/types/index.tsx`

## 🎨 Bindings desde Figma

### Cómo Conectar Diseños de Figma

1. **Exportar desde Figma Make**
   - Diseña tu pantalla en Figma
   - Exporta como componente React desde Figma Make
   - Coloca el archivo en `/components/` o `/pages/`

2. **Conectar con Datos Reales**
   
   Ejemplo para un Card de Producto:
   
   ```tsx
   // Tu componente exportado de Figma
   import { FigmaProductCard } from './imports/ProductCardFromFigma';
   
   // Wrapper con datos reales
   function ProductCardWithData({ product }) {
     return (
       <FigmaProductCard
         nombre={product.nombre}
         precio={`Bs. ${product.precio}`}
         imagen={product.imagen_url}
         stock={product.stock}
         onClick={() => handleViewProduct(product.id)}
       />
     );
   }
   ```

3. **Usar Hooks de Estado**
   
   ```tsx
   import { useAuth } from '../hooks/useAuth';
   import { useCart } from '../hooks/useCart';
   
   function MyComponent() {
     const { user } = useAuth();
     const { cart, addToCart } = useCart();
     
     // Usar en tu componente de Figma
   }
   ```

## 🔒 Seguridad

### Consideraciones Importantes

1. **RLS Habilitado**: Todas las tablas tienen RLS activo
2. **Service Role Key**: Solo se usa en el servidor, nunca en el frontend
3. **Access Tokens**: Se envían en headers de Authorization
4. **Validaciones**: Tanto en frontend como backend

### Testing de Seguridad

```sql
-- Verificar que un estudiante NO puede ver productos de otros
SET request.jwt.claims = '{"sub":"user-id-estudiante"}';
SELECT * FROM products WHERE activo = false;
-- Debería retornar vacío

-- Verificar que un vendedor puede ver sus productos
SET request.jwt.claims = '{"sub":"user-id-vendedor"}';
SELECT * FROM products WHERE vendedor_id = 'user-id-vendedor';
-- Debería retornar sus productos
```

## 📊 Monitoreo y Logs

### Logs del Servidor

Todos los errores se loguean en la consola de Supabase Functions:
1. Ve a `Edge Functions` > `make-server-7ff09ef6` > `Logs`
2. Revisa errores y requests

### Logs del Frontend

Usa la consola del navegador:
- Errores de API
- Estados de autenticación
- Operaciones del carrito

## 🚀 Próximos Pasos

### Funcionalidades a Implementar

1. **Carrito Completo**
   - Vista detallada del carrito
   - Actualización de cantidades
   - Proceso de checkout

2. **Panel de Vendedor**
   - CRUD de productos
   - Ver ventas
   - Estadísticas

3. **Panel de Admin**
   - Gestión de usuarios
   - Gestión de categorías
   - Todas las órdenes
   - Estadísticas del sistema

4. **Mejoras de UX**
   - Notificaciones en tiempo real
   - Paginación de productos
   - Imágenes múltiples por producto
   - Reviews y ratings

5. **Features Avanzados**
   - Chat entre comprador y vendedor
   - Sistema de notificaciones
   - Historial de precios
   - Productos favoritos

## 🐛 Troubleshooting

### Error: "No authorization token provided"
- Verifica que estés enviando el access token en el header
- Revisa que el usuario haya hecho login correctamente

### Error: "RLS policy violation"
- Verifica las políticas RLS en Supabase
- Asegúrate de que el usuario tenga el rol correcto

### Error: "Product not found"
- Verifica que el producto exista y esté activo
- Revisa que el ID sea correcto

### Error al crear orden: "Stock insuficiente"
- El producto no tiene stock suficiente
- Actualiza el stock del producto

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Hono](https://hono.dev/)
- [Documentación de React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**¿Necesitas ayuda?** Revisa los logs y la consola para mensajes de error detallados. Todos los endpoints retornan mensajes de error descriptivos.
