# 📦 Cargar Datos Mock

## 🎯 Objetivo

Este script agrega datos de prueba (mock) a la base de datos para que la aplicación se vea más poblada y sea más fácil de probar.

## 📋 Contenido del Script

El archivo `mock_data.sql` incluye:

### Categorías Adicionales (10 nuevas):
- 📚 Libros y Material Académico
- 🔌 Electrónica
- 👕 Ropa y Accesorios
- 🍔 Alimentación
- 🎨 Arte y Manualidades
- ⚽ Deportes
- 🏠 Hogar y Decoración
- 💻 Tecnología
- 🛠️ Servicios
- 📦 Otros

### Productos Mock (60+ productos):
- **Libros y Material Académico**: 8 productos (libros, calculadoras, cuadernos)
- **Electrónica**: 7 productos (cargadores, auriculares, mouse, teclados)
- **Ropa y Accesorios**: 5 productos (camisetas, mochilas, gorras)
- **Alimentación**: 5 productos (café, snacks, bebidas)
- **Arte y Manualidades**: 5 productos (acuarelas, lápices, pinceles)
- **Deportes**: 5 productos (balones, raquetas, accesorios)
- **Tecnología**: 6 productos (laptops, tablets, monitores)
- **Hogar y Decoración**: 5 productos (lámparas, organizadores, plantas)
- **Servicios**: 5 productos (tutorías, traducción, diseño)
- **Otros**: 5 productos (candados, paraguas, termos)

## 🚀 Cómo Ejecutar

### Paso 1: Preparar la Base de Datos

Asegúrate de haber ejecutado primero `database_setup.sql`:

1. Ve a Supabase Dashboard
2. Abre **SQL Editor**
3. Ejecuta `database_setup.sql` completo
4. Verifica que las tablas se hayan creado

### Paso 2: Cargar Datos Mock

1. En Supabase Dashboard, ve a **SQL Editor**
2. Crea una nueva query
3. Abre el archivo `mock_data.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **"Run"** o presiona `Ctrl+Enter`

### Paso 3: Verificar los Datos

Ejecuta estas consultas para verificar:

```sql
-- Ver todas las categorías
SELECT nombre, COUNT(p.id) as total_productos 
FROM public.categories c 
LEFT JOIN public.products p ON p.categoria_id = c.id 
GROUP BY c.nombre 
ORDER BY total_productos DESC;

-- Ver todos los productos
SELECT nombre, precio, stock, c.nombre as categoria
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.categoria_id
ORDER BY c.nombre, p.nombre;

-- Contar productos por categoría
SELECT c.nombre as categoria, COUNT(p.id) as productos
FROM public.categories c
LEFT JOIN public.products p ON p.categoria_id = c.id
GROUP BY c.nombre
ORDER BY productos DESC;
```

## 📊 Estadísticas Esperadas

Después de ejecutar el script:

- ✅ **Categorías**: ~15 categorías (5 iniciales + 10 nuevas)
- ✅ **Productos**: ~60+ productos
- ✅ **Precios**: Desde $5,000 hasta $1,800,000
- ✅ **Stock**: Variado (1-20 unidades por producto)

## 🔄 Ejecutar Múltiples Veces

El script es **seguro de ejecutar múltiples veces** porque usa:
- `INSERT ... ON CONFLICT DO NOTHING` para categorías
- Evita duplicados automáticamente

## 🎨 Imágenes

Los productos incluyen URLs de imágenes de ejemplo usando Unsplash. Puedes:
- Dejarlas así para desarrollo
- Cambiarlas por imágenes reales después
- Subir imágenes a Supabase Storage y actualizar las URLs

## ⚠️ Notas Importantes

1. **vendedor_id**: Los productos se crean sin vendedor asignado (`NULL`). Puedes asignarlos después a usuarios vendedores reales.

2. **Stock**: El stock está configurado para simular disponibilidad real. Algunos productos tienen stock limitado.

3. **Precios**: Los precios están en pesos colombianos (COP) y son ejemplos. Ajusta según necesites.

4. **Servicios**: Los productos de "Servicios" tienen stock de 999 para indicar que son servicios ilimitados.

## 🧹 Limpiar Datos Mock (Opcional)

Si quieres eliminar los datos mock y empezar de nuevo:

```sql
-- CUIDADO: Esto elimina TODOS los productos y categorías
-- (excepto las categorías iniciales si tienen productos relacionados)

-- Eliminar productos mock (ajusta según necesites)
DELETE FROM public.products 
WHERE nombre IN (
  'Cálculo Diferencial - Stewart',
  'Física Universitaria Vol. 1',
  -- ... otros nombres de productos mock
);

-- Eliminar categorías mock (si no tienen productos)
DELETE FROM public.categories 
WHERE nombre IN (
  'Libros y Material Académico',
  'Electrónica',
  -- ... otras categorías mock
);
```

## ✅ Verificación Final

Después de cargar los datos:

1. ✅ Ve a la aplicación en `http://localhost:4173`
2. ✅ Navega a `/catalogo`
3. ✅ Deberías ver muchos productos organizados por categorías
4. ✅ Prueba filtrar por categorías
5. ✅ Prueba buscar productos

---

**¿Listo?** Ejecuta el script SQL y disfruta de una base de datos poblada. 🎉

