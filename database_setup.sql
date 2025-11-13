-- ============================================
-- ESQUEMA COMPLETO DE BASE DE DATOS
-- E-commerce System for Univalle
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla de perfiles de usuario (complementa auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
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
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
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
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, producto_id)
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS public.orders (
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
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de almacenamiento clave-valor (para Edge Functions)
CREATE TABLE IF NOT EXISTS public.kv_store_7ff09ef6 (
    key TEXT NOT NULL PRIMARY KEY,
    value JSONB NOT NULL
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_categoria ON public.products(categoria_id);
CREATE INDEX IF NOT EXISTS idx_products_vendedor ON public.products(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_products_activo ON public.products(activo);
CREATE INDEX IF NOT EXISTS idx_cart_items_carrito ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_producto ON public.cart_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_orders_usuario ON public.orders(usuario_id);
CREATE INDEX IF NOT EXISTS idx_orders_estado ON public.orders(estado);
CREATE INDEX IF NOT EXISTS idx_order_items_orden ON public.order_items(orden_id);

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

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_orden IS NULL THEN
        NEW.numero_orden = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

DROP TRIGGER IF EXISTS generate_order_number_trigger ON public.orders;
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders
    FOR EACH ROW
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
ALTER TABLE public.kv_store_7ff09ef6 ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: USER_PROFILES
-- ============================================

DROP POLICY IF EXISTS "Perfiles públicos son visibles" ON public.user_profiles;
CREATE POLICY "Perfiles públicos son visibles" ON public.user_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON public.user_profiles;
CREATE POLICY "Usuarios pueden crear su perfil" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON public.user_profiles;
CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins pueden actualizar perfiles" ON public.user_profiles;
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

DROP POLICY IF EXISTS "Categorías activas visibles" ON public.categories;
CREATE POLICY "Categorías activas visibles" ON public.categories
    FOR SELECT USING (activo = true OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND rol IN ('admin', 'vendedor')
    ));

DROP POLICY IF EXISTS "Admins pueden gestionar categorías" ON public.categories;
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

DROP POLICY IF EXISTS "Productos activos visibles" ON public.products;
CREATE POLICY "Productos activos visibles" ON public.products
    FOR SELECT USING (
        activo = true OR 
        vendedor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

DROP POLICY IF EXISTS "Vendedores pueden crear productos" ON public.products;
CREATE POLICY "Vendedores pueden crear productos" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol IN ('vendedor', 'admin')
        )
    );

DROP POLICY IF EXISTS "Vendedores pueden actualizar sus productos" ON public.products;
CREATE POLICY "Vendedores pueden actualizar sus productos" ON public.products
    FOR UPDATE USING (
        vendedor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

DROP POLICY IF EXISTS "Vendedores pueden eliminar sus productos" ON public.products;
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

DROP POLICY IF EXISTS "Usuarios ven su carrito" ON public.carts;
CREATE POLICY "Usuarios ven su carrito" ON public.carts
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden crear carrito" ON public.carts;
CREATE POLICY "Usuarios pueden crear carrito" ON public.carts
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden actualizar carrito" ON public.carts;
CREATE POLICY "Usuarios pueden actualizar carrito" ON public.carts
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS: CART_ITEMS
-- ============================================

DROP POLICY IF EXISTS "Usuarios ven items de su carrito" ON public.cart_items;
CREATE POLICY "Usuarios ven items de su carrito" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuarios pueden agregar items" ON public.cart_items;
CREATE POLICY "Usuarios pueden agregar items" ON public.cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_id AND carts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuarios pueden actualizar items" ON public.cart_items;
CREATE POLICY "Usuarios pueden actualizar items" ON public.cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_id AND carts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuarios pueden eliminar items" ON public.cart_items;
CREATE POLICY "Usuarios pueden eliminar items" ON public.cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_id AND carts.user_id = auth.uid()
        )
    );

-- ============================================
-- POLÍTICAS: ORDERS
-- ============================================

DROP POLICY IF EXISTS "Usuarios ven sus órdenes" ON public.orders;
CREATE POLICY "Usuarios ven sus órdenes" ON public.orders
    FOR SELECT USING (
        usuario_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'vendedor')
        )
    );

DROP POLICY IF EXISTS "Usuarios pueden crear órdenes" ON public.orders;
CREATE POLICY "Usuarios pueden crear órdenes" ON public.orders
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Admins pueden actualizar órdenes" ON public.orders;
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

DROP POLICY IF EXISTS "Usuarios ven items de sus órdenes" ON public.order_items;
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

DROP POLICY IF EXISTS "Sistema puede insertar items de orden" ON public.order_items;
CREATE POLICY "Sistema puede insertar items de orden" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- ============================================
-- POLÍTICAS: KV_STORE
-- ============================================

DROP POLICY IF EXISTS "Todos pueden usar kv_store" ON public.kv_store_7ff09ef6;
CREATE POLICY "Todos pueden usar kv_store" ON public.kv_store_7ff09ef6
    FOR ALL USING (true);

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
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================

