-- ============================================
-- FIX: Política RLS para permitir registro de usuarios
-- ============================================

-- Función para crear perfil con SECURITY DEFINER (bypass RLS)
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

-- Dar permisos para que usuarios autenticados puedan ejecutar esta función
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- Ajustar la política para ser más permisiva durante el registro
-- Permitir inserción si el usuario está autenticado Y el id coincide
DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON public.user_profiles;
CREATE POLICY "Usuarios pueden crear su perfil" ON public.user_profiles
    FOR INSERT 
    WITH CHECK (
      auth.uid() = id OR
      -- Permitir si el usuario está recién registrado (dentro de la misma sesión)
      (auth.uid() IS NOT NULL AND id = auth.uid())
    );

-- También crear una política alternativa más permisiva
DROP POLICY IF EXISTS "Permitir creación de perfil durante registro" ON public.user_profiles;
CREATE POLICY "Permitir creación de perfil durante registro" ON public.user_profiles
    FOR INSERT 
    WITH CHECK (true);  -- Temporalmente permisiva, luego ajustar

-- Nota: La política anterior es muy permisiva. Si quieres más seguridad,
-- puedes usar solo la función create_user_profile que tiene SECURITY DEFINER

