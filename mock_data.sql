-- ============================================
-- DATOS MOCK PARA POBLAR LA BASE DE DATOS
-- E-commerce System for Univalle
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Ejecuta primero database_setup.sql
-- 2. Luego ejecuta este script para agregar datos de prueba
-- 3. Este script es seguro de ejecutar múltiples veces (usa INSERT ... ON CONFLICT)

-- ============================================
-- CATEGORÍAS ADICIONALES
-- ============================================

INSERT INTO public.categories (nombre, descripcion, activo) VALUES
('Libros y Material Académico', 'Libros de texto, apuntes, guías de estudio y material académico', true),
('Electrónica', 'Dispositivos electrónicos, accesorios y componentes', true),
('Ropa y Accesorios', 'Ropa, calzado y accesorios para estudiantes', true),
('Alimentación', 'Snacks, bebidas y alimentos para el día a día', true),
('Arte y Manualidades', 'Materiales de arte, manualidades y creatividad', true),
('Deportes', 'Artículos deportivos y equipamiento', true),
('Hogar y Decoración', 'Artículos para el hogar y decoración', true),
('Tecnología', 'Computadoras, tablets, smartphones y accesorios', true),
('Servicios', 'Servicios ofrecidos por estudiantes', true),
('Otros', 'Productos diversos y misceláneos', true)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- PRODUCTOS MOCK
-- ============================================
-- Nota: Los vendedor_id se dejarán NULL por ahora (se pueden asignar después)
-- Las categorías se asignan automáticamente según el nombre

-- Libros y Material Académico
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Libros y Material Académico' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Cálculo Diferencial - Stewart', 'Libro de cálculo diferencial en excelente estado, edición 8va', 45000.00, 3, NULL, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', true),
    ('Física Universitaria Vol. 1', 'Física para ciencias e ingeniería, usado pero en buen estado', 55000.00, 2, NULL, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', true),
    ('Química Orgánica - McMurry', 'Libro de química orgánica, edición reciente', 60000.00, 1, NULL, 'https://images.unsplash.com/photo-1532619675605-1ede6c4ed2b0?w=400', true),
    ('Apuntes de Programación', 'Apuntes completos de programación orientada a objetos', 15000.00, 5, NULL, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', true),
    ('Guía de Estudio - Álgebra Lineal', 'Guía completa con ejercicios resueltos de álgebra lineal', 20000.00, 4, NULL, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', true),
    ('Libro de Estadística', 'Estadística descriptiva e inferencial, muy completo', 40000.00, 2, NULL, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', true),
    ('Calculadora Científica TI-84', 'Calculadora gráfica Texas Instruments, usada', 180000.00, 1, NULL, 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400', true),
    ('Cuadernos Universitarios (Pack 5)', 'Pack de 5 cuadernos universitarios rayados', 12000.00, 10, NULL, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Electrónica
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Electrónica' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Cargador USB-C Original', 'Cargador USB-C de 65W, original y en perfecto estado', 35000.00, 4, NULL, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', true),
    ('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 85000.00, 3, NULL, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', true),
    ('Mouse Inalámbrico Logitech', 'Mouse ergonómico inalámbrico, perfecto para estudiar', 45000.00, 5, NULL, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', true),
    ('Teclado Mecánico RGB', 'Teclado mecánico con retroiluminación RGB, usado 6 meses', 120000.00, 2, NULL, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400', true),
    ('Cable HDMI 2m', 'Cable HDMI de alta velocidad, 2 metros', 15000.00, 8, NULL, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', true),
    ('Power Bank 20000mAh', 'Batería externa de 20000mAh con carga rápida', 65000.00, 3, NULL, 'https://images.unsplash.com/photo-1609091839311-d5365fcc8d5a?w=400', true),
    ('Adaptador USB-C a HDMI', 'Adaptador para conectar laptop a monitor/proyector', 25000.00, 4, NULL, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Ropa y Accesorios
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Ropa y Accesorios' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Camiseta Univalle', 'Camiseta oficial de la Universidad del Valle, talla M', 35000.00, 5, NULL, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', true),
    ('Hoodie Univalle', 'Sudadera con capucha, talla L, nuevo', 85000.00, 3, NULL, 'https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=400', true),
    ('Mochila Universitaria', 'Mochila resistente con compartimentos para laptop', 95000.00, 4, NULL, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', true),
    ('Gorra Univalle', 'Gorra ajustable con logo de la universidad', 25000.00, 6, NULL, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', true),
    ('Bufanda de Lana', 'Bufanda de lana, perfecta para el frío', 20000.00, 4, NULL, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Alimentación
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Alimentación' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Café Premium (250g)', 'Café colombiano tostado, molido, 250 gramos', 18000.00, 10, NULL, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', true),
    ('Snacks Variados (Pack)', 'Pack de snacks variados para estudiar', 12000.00, 15, NULL, 'https://images.unsplash.com/photo-1579952363873-27f3b1f0b0c8?w=400', true),
    ('Agua Embotellada (Pack 12)', 'Pack de 12 botellas de agua de 500ml', 15000.00, 8, NULL, 'https://images.unsplash.com/photo-1548839140-5a6c48ff9022?w=400', true),
    ('Barra Energética (Pack 6)', 'Barras energéticas para mantenerte activo', 18000.00, 12, NULL, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', true),
    ('Jugo Natural', 'Jugo natural de frutas, hecho en casa', 5000.00, 20, NULL, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Arte y Manualidades
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Arte y Manualidades' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Set de Acuarelas', 'Set completo de acuarelas profesionales, 24 colores', 65000.00, 2, NULL, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true),
    ('Lápices de Colores (Pack 24)', 'Pack de 24 lápices de colores profesionales', 35000.00, 4, NULL, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true),
    ('Block de Dibujo A4', 'Block de papel para dibujo, 50 hojas', 15000.00, 6, NULL, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', true),
    ('Pinceles Variados (Set 10)', 'Set de 10 pinceles de diferentes tamaños', 25000.00, 3, NULL, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true),
    ('Marcadores Permanentes (Pack 12)', 'Pack de 12 marcadores permanentes de colores', 18000.00, 5, NULL, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Deportes
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Deportes' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Balón de Fútbol', 'Balón de fútbol oficial, tamaño 5', 45000.00, 3, NULL, 'https://images.unsplash.com/photo-1575361204480-05e6e6f283c2?w=400', true),
    ('Raqueta de Tenis', 'Raqueta de tenis profesional, usada pero en buen estado', 120000.00, 2, NULL, 'https://images.unsplash.com/photo-1622163642993-854c8c81a0a8?w=400', true),
    ('Pelota de Baloncesto', 'Pelota de baloncesto oficial, tamaño 7', 55000.00, 2, NULL, 'https://images.unsplash.com/photo-1546519638-70e059630e3a?w=400', true),
    ('Toalla Deportiva', 'Toalla deportiva absorbente, tamaño grande', 25000.00, 5, NULL, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', true),
    ('Botella Deportiva', 'Botella de agua deportiva, 750ml, acero inoxidable', 30000.00, 4, NULL, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Tecnología
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Tecnología' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Laptop Dell Inspiron', 'Laptop Dell Inspiron 15, Intel i5, 8GB RAM, 256GB SSD, usado 1 año', 1800000.00, 1, NULL, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', true),
    ('Tablet Samsung Galaxy', 'Tablet Samsung Galaxy Tab A8, 64GB, perfecta para tomar notas', 450000.00, 2, NULL, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', true),
    ('Monitor 24" Full HD', 'Monitor LG 24 pulgadas Full HD, usado pero en excelente estado', 350000.00, 1, NULL, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', true),
    ('Webcam HD 1080p', 'Webcam Logitech C920, perfecta para clases online', 180000.00, 3, NULL, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', true),
    ('Disco Duro Externo 1TB', 'Disco duro externo USB 3.0, 1TB de capacidad', 180000.00, 2, NULL, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400', true),
    ('Memoria RAM 8GB DDR4', 'Memoria RAM 8GB DDR4, compatible con la mayoría de laptops', 120000.00, 3, NULL, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Hogar y Decoración
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Hogar y Decoración' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Lámpara de Escritorio LED', 'Lámpara de escritorio con luz LED ajustable', 45000.00, 4, NULL, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', true),
    ('Organizador de Escritorio', 'Organizador de escritorio con múltiples compartimentos', 25000.00, 5, NULL, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', true),
    ('Planta de Interior', 'Planta de interior decorativa, fácil de cuidar', 20000.00, 6, NULL, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', true),
    ('Almohada Decorativa', 'Almohada decorativa para la habitación, varios diseños', 30000.00, 4, NULL, 'https://images.unsplash.com/photo-1584100936595-4553e3c0c476?w=400', true),
    ('Espejo de Pared', 'Espejo decorativo para la pared, 40x60cm', 55000.00, 2, NULL, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Servicios
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Servicios' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Clases Particulares de Matemáticas', 'Clases particulares de matemáticas, cálculo y álgebra', 30000.00, 999, NULL, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', true),
    ('Tutoría de Programación', 'Tutoría personalizada de programación en Python/Java', 35000.00, 999, NULL, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', true),
    ('Traducción de Documentos', 'Servicio de traducción inglés-español', 25000.00, 999, NULL, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400', true),
    ('Diseño Gráfico', 'Servicio de diseño gráfico para proyectos académicos', 50000.00, 999, NULL, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', true),
    ('Edición de Videos', 'Servicio de edición de videos para proyectos', 60000.00, 999, NULL, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- Otros
INSERT INTO public.products (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
SELECT 
    nombre,
    descripcion,
    precio,
    stock,
    (SELECT id FROM public.categories WHERE nombre = 'Otros' LIMIT 1),
    imagen_url,
    true
FROM (VALUES
    ('Candado para Casillero', 'Candado de combinación para casillero universitario', 15000.00, 8, NULL, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', true),
    ('Paraguas Plegable', 'Paraguas plegable compacto, perfecto para la lluvia', 20000.00, 6, NULL, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400', true),
    ('Termo Acero Inoxidable', 'Termo de acero inoxidable, mantiene temperatura 12 horas', 35000.00, 4, NULL, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', true),
    ('Candado para Bicicleta', 'Candado en U para bicicleta, alta seguridad', 45000.00, 3, NULL, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', true),
    ('Kit de Herramientas Básicas', 'Kit básico de herramientas para reparaciones', 55000.00, 2, NULL, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', true)
) AS v(nombre, descripcion, precio, stock, categoria_id, imagen_url, activo)
ON CONFLICT DO NOTHING;

-- ============================================
-- RESUMEN
-- ============================================
-- Este script agrega:
-- - 10 categorías adicionales
-- - Más de 60 productos distribuidos en diferentes categorías
-- - Precios variados desde $5,000 hasta $1,800,000
-- - Stock variado para simular disponibilidad real
-- - URLs de imágenes de ejemplo (puedes cambiarlas después)

-- Para verificar los datos insertados:
-- SELECT COUNT(*) FROM public.categories;
-- SELECT COUNT(*) FROM public.products;
-- SELECT c.nombre, COUNT(p.id) as productos FROM public.categories c LEFT JOIN public.products p ON p.categoria_id = c.id GROUP BY c.nombre ORDER BY productos DESC;

