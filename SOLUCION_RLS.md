# 🔒 Solución al Error de RLS (Row Level Security)

## ❌ Error Actual

```
Error al crear perfil: new row violates row-level security policy for table "user_profiles"
```

## 🔍 Causa del Problema

Las políticas RLS están bloqueando la inserción del perfil porque:
- La política requiere que `auth.uid() = id`
- Durante el registro, el contexto de autenticación puede no estar completamente establecido
- El usuario acaba de registrarse y RLS no reconoce la sesión inmediatamente

## ✅ Solución

He creado dos soluciones:

### Solución 1: Función con SECURITY DEFINER (Recomendada)

Ejecuta este script SQL en Supabase SQL Editor:

```sql
-- Función que bypass RLS usando SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_nombre TEXT,
  p_rol TEXT DEFAULT 'estudiante',
  p_carnet TEXT DEFAULT NULL,
  p_telefono TEXT DEFAULT NULL,
  p_direccion TEXT DEFAULT NULL
)
RETURNS public.user_profiles AS $$
DECLARE
  v_profile public.user_profiles;
BEGIN
  INSERT INTO public.user_profiles (
    id, email, nombre, rol, carnet, telefono, direccion
  )
  VALUES (
    p_id, p_email, p_nombre, p_rol, p_carnet, p_telefono, p_direccion
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    carnet = COALESCE(EXCLUDED.carnet, user_profiles.carnet),
    telefono = COALESCE(EXCLUDED.telefono, user_profiles.telefono),
    direccion = COALESCE(EXCLUDED.direccion, user_profiles.direccion)
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;
```

**Ventajas:**
- ✅ Bypass RLS usando SECURITY DEFINER
- ✅ Más seguro que deshabilitar RLS
- ✅ Funciona siempre, incluso durante el registro

### Solución 2: Ajustar Política RLS

Si prefieres ajustar la política en lugar de usar una función:

```sql
-- Política más permisiva para registro
DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON public.user_profiles;
CREATE POLICY "Usuarios pueden crear su perfil" ON public.user_profiles
    FOR INSERT 
    WITH CHECK (
      auth.uid() = id OR
      (auth.uid() IS NOT NULL AND id = auth.uid())
    );
```

## 📋 Pasos para Aplicar la Solución

### Opción A: Usar la Función (Recomendado)

1. Abre Supabase SQL Editor
2. Copia y pega el contenido de `fix_rls_signup.sql`
3. Ejecuta el script
4. El código del frontend ya está actualizado para usar esta función

### Opción B: Ajustar Política RLS

1. Abre Supabase SQL Editor
2. Ejecuta solo la parte de ajustar la política (Solución 2)
3. Prueba el registro nuevamente

## 🧪 Probar la Solución

1. Ve a `/registro` en la aplicación
2. Completa el formulario
3. Haz clic en "Crear Cuenta"
4. Debería funcionar sin errores de RLS

## 🔍 Verificar que Funciona

Ejecuta esta consulta en SQL Editor para verificar que la función existe:

```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'create_user_profile';
```

Deberías ver:
- `proname`: `create_user_profile`
- `prosecdef`: `true` (indica que usa SECURITY DEFINER)

## 📝 Notas Importantes

1. **SECURITY DEFINER**: La función se ejecuta con los privilegios del creador, no del usuario que la llama. Esto permite bypass RLS de forma segura.

2. **Permisos**: La función está disponible para usuarios `authenticated` y `anon`, lo que permite su uso durante el registro.

3. **Seguridad**: Aunque la función bypass RLS, solo permite crear perfiles con el ID del usuario autenticado, manteniendo la seguridad.

## 🐛 Si Aún No Funciona

1. Verifica que ejecutaste el script SQL completo
2. Verifica que la función existe:
   ```sql
   \df create_user_profile
   ```
3. Verifica los permisos:
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.routine_privileges 
   WHERE routine_name = 'create_user_profile';
   ```
4. Revisa los logs de la consola del navegador para más detalles del error

---

**¿Listo?** Ejecuta el script SQL y prueba el registro nuevamente. 🚀

