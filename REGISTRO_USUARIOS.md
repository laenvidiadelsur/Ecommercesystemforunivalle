# 👤 Sistema de Registro de Usuarios

## ✅ Estado Actual

**SÍ, el registro está integrado y funcionando.** Cuando creas un usuario en el frontend, se crea automáticamente en la base de datos.

## 🔄 Cómo Funciona el Registro

### Flujo Completo:

1. **Usuario completa el formulario** en `/registro`
   - Email, contraseña, nombre, rol, etc.

2. **Frontend llama a `signUp()`**
   - Intenta usar Edge Functions primero
   - Si falla, usa Supabase directo (fallback automático)

3. **Se crea el usuario en Supabase Auth**
   - Usuario se registra en `auth.users`
   - Email se confirma automáticamente (si está configurado así)

4. **Se crea el perfil en `user_profiles`**
   - **Automáticamente** mediante un trigger en la base de datos
   - O manualmente si el trigger no está activo

5. **Usuario inicia sesión automáticamente**
   - Se carga el perfil
   - Se redirige al home

## 🗄️ Trigger Automático (Recomendado)

El script `database_setup.sql` incluye un trigger que crea automáticamente el perfil cuando se registra un usuario:

```sql
-- Trigger que crea el perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Ventajas:**
- ✅ Funciona incluso si las Edge Functions no están disponibles
- ✅ Más robusto y confiable
- ✅ No depende del código del frontend

## 🔧 Configuración Necesaria

### 1. Ejecutar el Script SQL

Asegúrate de haber ejecutado `database_setup.sql` completo, que incluye:
- ✅ Todas las tablas
- ✅ El trigger `on_auth_user_created`
- ✅ Las políticas RLS

### 2. Configurar Autenticación en Supabase

1. Ve a **Authentication** > **Providers** en Supabase Dashboard
2. Asegúrate de que **Email** esté habilitado
3. Para desarrollo, puedes desactivar **"Confirm email"** (opcional)
   - Esto permite que los usuarios inicien sesión inmediatamente

### 3. Verificar el Trigger

Ejecuta esta consulta en SQL Editor para verificar que el trigger existe:

```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

## 🧪 Probar el Registro

1. Ve a `/registro` en la aplicación
2. Completa el formulario:
   - Nombre: "Juan Pérez"
   - Email: "juan@ejemplo.com"
   - Contraseña: "password123"
   - Rol: "Estudiante" o "Vendedor"
3. Haz clic en "Crear Cuenta"
4. Deberías ver: "¡Cuenta creada exitosamente!"
5. Verifica en Supabase:
   - **Authentication** > **Users**: Deberías ver el usuario
   - **Table Editor** > **user_profiles**: Deberías ver el perfil

## 🔍 Verificar que Funciona

### En Supabase Dashboard:

1. **Authentication > Users**
   - Deberías ver el usuario recién creado
   - Email confirmado (si está configurado así)

2. **Table Editor > user_profiles**
   - Deberías ver el perfil con:
     - `id`: UUID del usuario
     - `email`: Email del usuario
     - `nombre`: Nombre completo
     - `rol`: "estudiante" o "vendedor"
     - `carnet`, `telefono`, `direccion`: Si los proporcionaste

## 🐛 Solución de Problemas

### Error: "Error al crear perfil"

**Causa:** El trigger no está activo o las políticas RLS bloquean la inserción.

**Solución:**
1. Verifica que ejecutaste el script SQL completo
2. Verifica que el trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Si no existe, ejecuta esta parte del script:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.user_profiles (id, email, nombre, rol)
     VALUES (
       NEW.id,
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
       COALESCE(NEW.raw_user_meta_data->>'rol', 'estudiante')
     )
     ON CONFLICT (id) DO NOTHING;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW
     EXECUTE FUNCTION public.handle_new_user();
   ```

### Error: "Email already registered"

**Causa:** El email ya está registrado.

**Solución:** Usa otro email o elimina el usuario existente en Supabase.

### El usuario se crea pero no el perfil

**Causa:** El trigger no se ejecutó o falló.

**Solución:**
1. Verifica que el trigger existe
2. Crea el perfil manualmente:
   ```sql
   INSERT INTO public.user_profiles (id, email, nombre, rol)
   VALUES (
     'UUID-DEL-USUARIO',
     'email@ejemplo.com',
     'Nombre Usuario',
     'estudiante'
   );
   ```

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado completamente
- [ ] Trigger `on_auth_user_created` existe
- [ ] Email/Password habilitado en Authentication
- [ ] Políticas RLS configuradas correctamente
- [ ] Probaste crear un usuario desde el frontend
- [ ] Usuario aparece en `auth.users`
- [ ] Perfil aparece en `user_profiles`

## 📝 Notas Importantes

1. **El trigger es la forma más confiable** de crear perfiles automáticamente
2. **El código del frontend tiene fallback** si las Edge Functions no están disponibles
3. **Las políticas RLS** permiten que los usuarios creen su propio perfil
4. **El email debe ser único** en la tabla `user_profiles`

---

**¿Todo funcionando?** Si creaste un usuario y aparece en ambas tablas (`auth.users` y `user_profiles`), entonces está completamente integrado. 🎉

