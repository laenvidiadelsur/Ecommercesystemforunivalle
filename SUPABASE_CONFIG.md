# 🔧 Configuración de Supabase

## ✅ Estado Actual

La conexión a Supabase está **funcionando correctamente**. La configuración actual es:

### Credenciales Configuradas

- **Project ID**: `utrqrjvxfpxyvrgxslet`
- **Supabase URL**: `https://utrqrjvxfpxyvrgxslet.supabase.co`
- **Public Anon Key**: Configurada en `src/utils/supabase/info.tsx`
- **Edge Function**: `make-server-7ff09ef6`
- **API Base URL**: `https://utrqrjvxfpxyvrgxslet.supabase.co/functions/v1/make-server-7ff09ef6`

### Archivos de Configuración

1. **`src/utils/supabase/info.tsx`** - Contiene las credenciales del proyecto
2. **`src/utils/supabase/client.tsx`** - Cliente de Supabase para el frontend
3. **`src/utils/api.tsx`** - Cliente API para las Edge Functions
4. **`src/supabase/functions/server/`** - Edge Functions del backend

## 🔐 Variables de Entorno (Edge Functions)

Las Edge Functions de Supabase usan automáticamente estas variables de entorno (proporcionadas por Supabase):

- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_ANON_KEY` - Clave pública anónima
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio (solo en Edge Functions)

**Nota**: Estas variables se configuran automáticamente cuando despliegas las Edge Functions en Supabase. No necesitas configurarlas manualmente.

## 🚀 Mejoras Implementadas

### 1. Validación de Configuración
- Se agregó validación para asegurar que las credenciales estén presentes
- Mensajes de error más claros si falta configuración

### 2. Manejo de Sesiones
- Persistencia de sesión habilitada
- Auto-refresh de tokens
- Detección automática de sesión en URL

### 3. Manejo de Errores Mejorado
- Mejor manejo de errores de conexión
- Validación de respuestas JSON
- Mensajes de error más descriptivos

## 📝 Verificación de Conexión

Para verificar que la conexión funciona:

1. **Frontend**: La aplicación debería conectarse automáticamente al iniciar
2. **Backend**: Las Edge Functions deberían responder a las peticiones API
3. **Base de Datos**: Las consultas deberían ejecutarse correctamente

## 🔄 Si Necesitas Cambiar la Configuración

Si necesitas cambiar las credenciales de Supabase:

1. Edita `src/utils/supabase/info.tsx` con tus nuevas credenciales
2. Reconstruye la aplicación: `npm run build`
3. Si cambias el Project ID, actualiza también `src/utils/api.tsx` (línea 3)

## 📊 Estructura de la Base de Datos

La aplicación espera estas tablas en Supabase:

- `user_profiles` - Perfiles de usuario
- `categories` - Categorías de productos
- `products` - Productos
- `carts` - Carritos de compra
- `cart_items` - Items del carrito
- `orders` - Órdenes
- `order_items` - Items de las órdenes
- `kv_store_7ff09ef6` - Almacenamiento clave-valor

Consulta `src/ARQUITECTURA.md` para el esquema completo de la base de datos.

## ✅ Todo Listo

La configuración está completa y funcionando. No se requieren cambios adicionales.

