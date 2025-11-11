# Sistema de Venta de Productos - Universidad Univalle

## 📋 Modelo de Dominio

### Entidades Principales

#### **Usuario (User)**
- `id`: UUID (PK, generado por Supabase Auth)
- `email`: string (único)
- `nombre`: string
- `rol`: enum ('estudiante', 'vendedor', 'admin')
- `carnet`: string (opcional, para estudiantes)
- `telefono`: string
- `direccion`: string
- `created_at`: timestamp

#### **Categoría (Category)**
- `id`: UUID (PK)
- `nombre`: string
- `descripcion`: string
- `imagen_url`: string
- `activo`: boolean
- `created_at`: timestamp

#### **Producto (Product)**
- `id`: UUID (PK)
- `nombre`: string
- `descripcion`: string
- `precio`: decimal
- `stock`: integer
- `categoria_id`: UUID (FK → Category)
- `vendedor_id`: UUID (FK → User)
- `imagen_url`: string
- `imagenes_adicionales`: array de strings
- `activo`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

#### **Carrito (Cart)**
- `id`: UUID (PK)
- `usuario_id`: UUID (FK → User, unique)
- `created_at`: timestamp
- `updated_at`: timestamp

#### **ItemCarrito (CartItem)**
- `id`: UUID (PK)
- `carrito_id`: UUID (FK → Cart)
- `producto_id`: UUID (FK → Product)
- `cantidad`: integer
- `precio_unitario`: decimal (snapshot del precio al agregarlo)
- `created_at`: timestamp

#### **Orden (Order)**
- `id`: UUID (PK)
- `numero_orden`: string (único, generado)
- `usuario_id`: UUID (FK → User)
- `total`: decimal
- `estado`: enum ('pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada')
- `direccion_entrega`: string
- `telefono_contacto`: string
- `notas`: text
- `created_at`: timestamp
- `updated_at`: timestamp

#### **ItemOrden (OrderItem)**
- `id`: UUID (PK)
- `orden_id`: UUID (FK → Order)
- `producto_id`: UUID (FK → Product)
- `cantidad`: integer
- `precio_unitario`: decimal (snapshot del precio al momento de compra)
- `subtotal`: decimal
- `created_at`: timestamp

---

## 🗄️ Esquema SQL para Supabase

```sql
-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (complementa auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('estudiante', 'vendedor', 'admin')),
    carnet TEXT,
    telefono TEXT,
    direccion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    vendedor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    imagen_url TEXT,
    imagenes_adicionales TEXT[],
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de carritos
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items del carrito
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrito_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(carrito_id, producto_id)
);

-- Tabla de órdenes
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_orden TEXT UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada')),
    direccion_entrega TEXT NOT NULL,
    telefono_contacto TEXT NOT NULL,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items de orden
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX idx_products_categoria ON public.products(categoria_id);
CREATE INDEX idx_products_vendedor ON public.products(vendedor_id);
CREATE INDEX idx_products_activo ON public.products(activo);
CREATE INDEX idx_cart_items_carrito ON public.cart_items(carrito_id);
CREATE INDEX idx_cart_items_producto ON public.cart_items(producto_id);
CREATE INDEX idx_orders_usuario ON public.orders(usuario_id);
CREATE INDEX idx_orders_estado ON public.orders(estado);
CREATE INDEX idx_order_items_orden ON public.order_items(orden_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_orden = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders
    FOR EACH ROW WHEN (NEW.numero_orden IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: USER_PROFILES
-- ============================================

-- Cualquiera puede ver perfiles públicos
CREATE POLICY "Perfiles públicos son visibles" ON public.user_profiles
    FOR SELECT USING (true);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Usuarios pueden crear su perfil" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Los admins pueden actualizar cualquier perfil
CREATE POLICY "Admins pueden actualizar perfiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ============================================
-- POLÍTICAS: CATEGORIES
-- ============================================

-- Todos pueden ver categorías activas
CREATE POLICY "Categorías activas visibles" ON public.categories
    FOR SELECT USING (activo = true OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND rol IN ('admin', 'vendedor')
    ));

-- Solo admins pueden crear/actualizar/eliminar categorías
CREATE POLICY "Admins pueden gestionar categorías" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ============================================
-- POLÍTICAS: PRODUCTS
-- ============================================

-- Todos pueden ver productos activos
CREATE POLICY "Productos activos visibles" ON public.products
    FOR SELECT USING (
        activo = true OR 
        vendedor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Vendedores y admins pueden crear productos
CREATE POLICY "Vendedores pueden crear productos" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol IN ('vendedor', 'admin')
        )
    );

-- Vendedores pueden actualizar sus productos, admins pueden actualizar todos
CREATE POLICY "Vendedores pueden actualizar sus productos" ON public.products
    FOR UPDATE USING (
        vendedor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Vendedores pueden eliminar sus productos, admins pueden eliminar todos
CREATE POLICY "Vendedores pueden eliminar sus productos" ON public.products
    FOR DELETE USING (
        vendedor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ============================================
-- POLÍTICAS: CARTS
-- ============================================

-- Los usuarios solo pueden ver su propio carrito
CREATE POLICY "Usuarios ven su carrito" ON public.carts
    FOR SELECT USING (usuario_id = auth.uid());

-- Los usuarios pueden crear su carrito
CREATE POLICY "Usuarios pueden crear carrito" ON public.carts
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Los usuarios pueden actualizar su carrito
CREATE POLICY "Usuarios pueden actualizar carrito" ON public.carts
    FOR UPDATE USING (usuario_id = auth.uid());

-- ============================================
-- POLÍTICAS: CART_ITEMS
-- ============================================

-- Los usuarios solo pueden ver items de su carrito
CREATE POLICY "Usuarios ven items de su carrito" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.carrito_id AND carts.usuario_id = auth.uid()
        )
    );

-- Los usuarios pueden agregar items a su carrito
CREATE POLICY "Usuarios pueden agregar items" ON public.cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = carrito_id AND carts.usuario_id = auth.uid()
        )
    );

-- Los usuarios pueden actualizar items de su carrito
CREATE POLICY "Usuarios pueden actualizar items" ON public.cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = carrito_id AND carts.usuario_id = auth.uid()
        )
    );

-- Los usuarios pueden eliminar items de su carrito
CREATE POLICY "Usuarios pueden eliminar items" ON public.cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = carrito_id AND carts.usuario_id = auth.uid()
        )
    );

-- ============================================
-- POLÍTICAS: ORDERS
-- ============================================

-- Los usuarios pueden ver sus propias órdenes, admins y vendedores ven todas
CREATE POLICY "Usuarios ven sus órdenes" ON public.orders
    FOR SELECT USING (
        usuario_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'vendedor')
        )
    );

-- Solo usuarios autenticados pueden crear órdenes
CREATE POLICY "Usuarios pueden crear órdenes" ON public.orders
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Admins pueden actualizar órdenes
CREATE POLICY "Admins pueden actualizar órdenes" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ============================================
-- POLÍTICAS: ORDER_ITEMS
-- ============================================

-- Los usuarios pueden ver items de sus órdenes, admins y vendedores ven todos
CREATE POLICY "Usuarios ven items de sus órdenes" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.orden_id AND orders.usuario_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'vendedor')
        )
    );

-- El sistema puede insertar items de orden (a través del servidor)
CREATE POLICY "Sistema puede insertar items de orden" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- ============================================
-- DATOS INICIALES (SEED)
-- ============================================

-- Insertar categorías por defecto
INSERT INTO public.categories (nombre, descripcion, activo) VALUES
('Libros', 'Libros académicos y de texto', true),
('Electrónica', 'Dispositivos y accesorios electrónicos', true),
('Papelería', 'Útiles escolares y de oficina', true),
('Ropa', 'Vestimenta y accesorios', true),
('Comida', 'Snacks y bebidas', true),
('Otros', 'Productos varios', true)
ON CONFLICT DO NOTHING;
```

---

## 🔐 Configuración de Auth en Supabase

### Roles y Permisos

1. **Estudiante**: Usuario básico que puede comprar productos
2. **Vendedor**: Puede crear y gestionar sus propios productos
3. **Admin**: Acceso total al sistema

### Flujo de Registro

1. Usuario se registra con email/password en Supabase Auth
2. Se crea automáticamente el perfil en `user_profiles` mediante trigger o endpoint
3. Se asigna rol por defecto: 'estudiante'

---

## 🔌 Estructura de Endpoints API

### **Autenticación**
- `POST /make-server-7ff09ef6/auth/signup` - Registro de usuario
- `POST /make-server-7ff09ef6/auth/login` - Login (manejado por cliente)
- `GET /make-server-7ff09ef6/auth/profile` - Obtener perfil actual
- `PUT /make-server-7ff09ef6/auth/profile` - Actualizar perfil

### **Productos**
- `GET /make-server-7ff09ef6/products` - Listar productos (filtros: categoría, búsqueda)
- `GET /make-server-7ff09ef6/products/:id` - Detalle de producto
- `POST /make-server-7ff09ef6/products` - Crear producto (vendedor/admin)
- `PUT /make-server-7ff09ef6/products/:id` - Actualizar producto
- `DELETE /make-server-7ff09ef6/products/:id` - Eliminar producto

### **Categorías**
- `GET /make-server-7ff09ef6/categories` - Listar categorías
- `POST /make-server-7ff09ef6/categories` - Crear categoría (admin)
- `PUT /make-server-7ff09ef6/categories/:id` - Actualizar categoría (admin)

### **Carrito**
- `GET /make-server-7ff09ef6/cart` - Obtener carrito actual
- `POST /make-server-7ff09ef6/cart/items` - Agregar item al carrito
- `PUT /make-server-7ff09ef6/cart/items/:id` - Actualizar cantidad
- `DELETE /make-server-7ff09ef6/cart/items/:id` - Eliminar item
- `DELETE /make-server-7ff09ef6/cart/clear` - Vaciar carrito

### **Órdenes**
- `GET /make-server-7ff09ef6/orders` - Listar mis órdenes
- `GET /make-server-7ff09ef6/orders/:id` - Detalle de orden
- `POST /make-server-7ff09ef6/orders` - Crear orden (checkout)
- `PUT /make-server-7ff09ef6/orders/:id/status` - Actualizar estado (admin)

### **Admin**
- `GET /make-server-7ff09ef6/admin/stats` - Estadísticas del sistema
- `GET /make-server-7ff09ef6/admin/orders` - Todas las órdenes
- `GET /make-server-7ff09ef6/admin/users` - Lista de usuarios

---

## 📱 Pantallas y Componentes Frontend

### Pantallas Principales

1. **Landing / Home** (`/`)
   - Hero con banner de Univalle
   - Categorías destacadas
   - Productos destacados
   - CTA para registro

2. **Catálogo** (`/catalogo`)
   - Grid de productos
   - Filtros por categoría
   - Búsqueda
   - Ordenamiento (precio, nombre, reciente)

3. **Detalle de Producto** (`/producto/:id`)
   - Imágenes del producto
   - Descripción completa
   - Precio y stock disponible
   - Botón "Agregar al carrito"
   - Información del vendedor

4. **Carrito** (`/carrito`)
   - Lista de productos en carrito
   - Actualizar cantidad
   - Eliminar items
   - Resumen de total
   - Botón "Proceder al pago"

5. **Checkout** (`/checkout`)
   - Formulario de dirección de entrega
   - Resumen de orden
   - Confirmar compra

6. **Mis Órdenes** (`/mis-ordenes`)
   - Historial de compras
   - Estado de cada orden
   - Detalle de orden

7. **Panel Vendedor** (`/vendedor`)
   - Mis productos
   - Crear/editar productos
   - Ventas realizadas

8. **Panel Admin** (`/admin`)
   - Gestión de categorías
   - Gestión de usuarios
   - Todas las órdenes
   - Estadísticas

9. **Login / Registro** (`/login`, `/registro`)
   - Formularios de autenticación

---

## 🔄 Workflows de Lógica de Negocio

### 1. Registro de Usuario
```
1. Usuario envía formulario (email, password, nombre, rol, carnet)
2. Backend crea usuario en Supabase Auth
3. Backend crea perfil en user_profiles
4. Retorna token de sesión
5. Frontend guarda token y redirige a home
```

### 2. Agregar Producto al Carrito
```
1. Usuario hace clic en "Agregar al carrito"
2. Frontend verifica sesión activa
3. Frontend envía POST /cart/items con {producto_id, cantidad}
4. Backend verifica stock disponible
5. Backend busca o crea carrito del usuario
6. Backend agrega o actualiza item en cart_items
7. Retorna carrito actualizado
8. Frontend actualiza contador de carrito
```

### 3. Proceso de Checkout
```
1. Usuario en /carrito hace clic en "Proceder al pago"
2. Frontend muestra formulario de dirección y teléfono
3. Usuario completa formulario y confirma
4. Frontend envía POST /orders con:
   - direccion_entrega
   - telefono_contacto
   - notas (opcional)
5. Backend inicia transacción:
   a. Verifica stock de todos los productos
   b. Crea registro en orders
   c. Crea registros en order_items (copia del carrito)
   d. Reduce stock de productos
   e. Vacía el carrito del usuario
   f. Commit de transacción
6. Backend retorna orden creada con numero_orden
7. Frontend muestra confirmación y redirige a /mis-ordenes
```

### 4. Actualizar Estado de Orden (Admin)
```
1. Admin accede a /admin/ordenes
2. Admin selecciona orden y cambia estado
3. Frontend envía PUT /orders/:id/status con {estado}
4. Backend verifica que usuario sea admin
5. Backend actualiza estado de orden
6. Frontend actualiza UI
```

### 5. Crear Producto (Vendedor)
```
1. Vendedor accede a /vendedor/nuevo-producto
2. Completa formulario (nombre, descripción, precio, stock, categoría, imagen)
3. Frontend sube imagen a Supabase Storage
4. Frontend envía POST /products con datos + URL de imagen
5. Backend verifica que usuario sea vendedor o admin
6. Backend crea producto con vendedor_id = auth.uid()
7. Frontend redirige a /vendedor/mis-productos
```

---

## 🎨 Bindings Sugeridos para MakerX (Figma → Supabase)

### Componente: Card de Producto
```tsx
// Figma Design: Producto Card
// Binding MakerX:
{
  nombre: product.nombre,
  precio: `Bs. ${product.precio}`,
  imagen: product.imagen_url,
  stock: product.stock > 0 ? 'Disponible' : 'Agotado',
  onClick: () => navigate(`/producto/${product.id}`)
}
```

### Componente: Lista de Carrito
```tsx
// Figma Design: Cart Item
// Binding MakerX:
{
  productos: cartItems.map(item => ({
    nombre: item.producto.nombre,
    cantidad: item.cantidad,
    precio: item.precio_unitario,
    subtotal: item.cantidad * item.precio_unitario,
    imagen: item.producto.imagen_url
  })),
  total: cartItems.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0)
}
```

### Componente: Orden Card
```tsx
// Figma Design: Order Card
// Binding MakerX:
{
  numero: order.numero_orden,
  fecha: new Date(order.created_at).toLocaleDateString(),
  total: `Bs. ${order.total}`,
  estado: order.estado,
  estadoColor: {
    pendiente: 'yellow',
    confirmada: 'blue',
    enviada: 'purple',
    entregada: 'green',
    cancelada: 'red'
  }[order.estado]
}
```

---

## 📁 Estructura de Proyecto Sugerida

```
/
├── App.tsx                          # Componente principal con routing
├── styles/
│   └── globals.css                  # Estilos globales
├── components/
│   ├── ui/                          # Componentes shadcn
│   ├── layout/
│   │   ├── Header.tsx               # Header con nav y carrito
│   │   ├── Footer.tsx
│   │   └── Layout.tsx               # Wrapper general
│   ├── products/
│   │   ├── ProductCard.tsx          # Card de producto
│   │   ├── ProductGrid.tsx          # Grid de productos
│   │   ├── ProductFilter.tsx        # Filtros
│   │   └── ProductDetail.tsx        # Detalle completo
│   ├── cart/
│   │   ├── CartItem.tsx             # Item del carrito
│   │   ├── CartSummary.tsx          # Resumen de totales
│   │   └── CartButton.tsx           # Botón del carrito en header
│   ├── orders/
│   │   ├── OrderCard.tsx            # Card de orden
│   │   ├── OrderDetail.tsx          # Detalle de orden
│   │   └── OrderStatus.tsx          # Badge de estado
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx       # HOC para rutas protegidas
│   └── admin/
│       ├── StatsCard.tsx
│       ├── UserTable.tsx
│       └── OrderManagement.tsx
├── pages/
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── ProductPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── MyOrders.tsx
│   ├── VendorDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── Login.tsx
│   └── Signup.tsx
├── hooks/
│   ├── useAuth.tsx                  # Hook de autenticación
│   ├── useCart.tsx                  # Hook del carrito
│   ├── useProducts.tsx              # Hook de productos
│   └── useOrders.tsx                # Hook de órdenes
├── utils/
│   ├── supabase/
│   │   ├── client.tsx               # Cliente de Supabase
│   │   └── info.tsx                 # Info del proyecto
│   └── api.tsx                      # Funciones para llamar al backend
├── types/
│   └── index.tsx                    # TypeScript types
└── supabase/
    └── functions/
        └── server/
            ├── index.tsx            # Servidor principal
            ├── routes/
            │   ├── auth.tsx         # Rutas de auth
            │   ├── products.tsx     # Rutas de productos
            │   ├── cart.tsx         # Rutas de carrito
            │   ├── orders.tsx       # Rutas de órdenes
            │   ├── categories.tsx   # Rutas de categorías
            │   └── admin.tsx        # Rutas de admin
            └── middleware/
                ├── auth.tsx         # Middleware de autenticación
                └── rbac.tsx         # Middleware de roles
```

---

## 🚀 Pasos para Implementar desde Figma

1. **Diseñar en Figma** las pantallas mencionadas arriba
2. **Exportar desde Figma Make** cada pantalla como componente React
3. **Integrar con Supabase**:
   - Ejecutar el esquema SQL en Supabase SQL Editor
   - Implementar los endpoints en el servidor
   - Conectar los componentes con los hooks y API
4. **Configurar Auth** en Supabase Dashboard (Email/Password)
5. **Crear bucket de Storage** para imágenes: `make-7ff09ef6-product-images`
6. **Probar flujos** completos de usuario

---

## 📊 Ejemplo de Uso de Datos

### Productos en el Frontend
```tsx
const { data: products } = await fetch(`${API_URL}/products?categoria=libros`)
  .then(res => res.json());

products.map(product => (
  <ProductCard key={product.id} {...product} />
))
```

### Agregar al Carrito
```tsx
const addToCart = async (productId, cantidad) => {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ producto_id: productId, cantidad })
  });
  return response.json();
};
```

---

## ✅ Checklist de Implementación

- [ ] Ejecutar esquema SQL en Supabase
- [ ] Configurar Auth (Email/Password)
- [ ] Crear bucket de Storage
- [ ] Implementar servidor con Hono
- [ ] Crear endpoints de API
- [ ] Implementar componentes React
- [ ] Conectar frontend con backend
- [ ] Probar políticas RLS
- [ ] Implementar manejo de errores
- [ ] Agregar validaciones
- [ ] Testing de flujos completos

---

Este documento es la base arquitectónica completa. Ahora procederé a implementar el código real.
