# 🗄️ Guía de Configuración de Base de Datos

## 📋 Pasos para Crear las Tablas en Supabase

### Paso 1: Acceder al SQL Editor

1. Ve a tu Dashboard de Supabase: https://supabase.com/dashboard/project/utrqrjvxfpxyvrgxslet
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** para crear una nueva consulta

### Paso 2: Ejecutar el Script SQL

1. Abre el archivo `database_setup.sql` en este proyecto
2. **Copia TODO el contenido** del archivo
3. **Pega el contenido** en el SQL Editor de Supabase
4. Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Paso 3: Verificar que se Crearon las Tablas

1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver estas tablas:
   - ✅ `user_profiles`
   - ✅ `categories`
   - ✅ `products`
   - ✅ `carts`
   - ✅ `cart_items`
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `kv_store_7ff09ef6`

### Paso 4: Verificar las Categorías

1. En **"Table Editor"**, abre la tabla `categories`
2. Deberías ver 6 categorías creadas automáticamente:
   - Libros
   - Electrónica
   - Papelería
   - Ropa
   - Comida
   - Otros

## ✅ Verificación Rápida

Ejecuta esta consulta en el SQL Editor para verificar:

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Deberías ver 8 tablas listadas.

## 🔐 Configuración de Autenticación

### Habilitar Email/Password

1. Ve a **"Authentication"** > **"Providers"** en el menú lateral
2. Asegúrate de que **"Email"** esté habilitado
3. Para desarrollo, desactiva **"Confirm email"** (opcional)
4. Guarda los cambios

## 🎯 Próximos Pasos

Una vez que las tablas estén creadas:

1. ✅ Las tablas están listas
2. ✅ Las políticas RLS están configuradas
3. ✅ Las categorías iniciales están creadas
4. ✅ Puedes empezar a usar la aplicación

## 🐛 Solución de Problemas

### Error: "relation already exists"
- Algunas tablas ya existen. El script usa `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutarlo de nuevo.

### Error: "permission denied"
- Asegúrate de estar usando el SQL Editor con permisos de administrador
- Verifica que estés conectado a tu proyecto correcto

### Error: "extension uuid-ossp does not exist"
- Este error es raro, pero si ocurre, ejecuta primero:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

## 📝 Notas Importantes

- **RLS está habilitado**: Todas las tablas tienen Row Level Security activo
- **Políticas configuradas**: Las políticas de seguridad ya están creadas
- **Triggers activos**: Los triggers para `updated_at` y números de orden están funcionando
- **Datos iniciales**: Las categorías se crean automáticamente

## 🔄 Si Necesitas Reiniciar

Si necesitas eliminar todas las tablas y empezar de nuevo:

```sql
-- ⚠️ CUIDADO: Esto eliminará TODOS los datos
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.kv_store_7ff09ef6 CASCADE;
```

Luego ejecuta el script `database_setup.sql` nuevamente.

---

**¿Listo?** Una vez ejecutado el script, tu base de datos estará completamente configurada y lista para usar. 🚀

