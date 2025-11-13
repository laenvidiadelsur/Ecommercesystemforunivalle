# 📧 Configuración de Email en Supabase

## ❌ Error: "Email not confirmed"

Este error aparece cuando Supabase está configurado para requerir confirmación de email antes de permitir el inicio de sesión.

## ✅ Solución: Deshabilitar Confirmación de Email (Desarrollo)

### Pasos en Supabase Dashboard:

1. **Ve a tu proyecto de Supabase:**
   - https://supabase.com/dashboard/project/utrqrjvxfpxyvrgxslet

2. **Navega a Authentication:**
   - En el menú lateral, haz clic en **"Authentication"**
   - Luego haz clic en **"Providers"**

3. **Configura Email Provider:**
   - Busca **"Email"** en la lista de proveedores
   - Haz clic en el ícono de configuración (⚙️) o en **"Email"**

4. **Deshabilita la Confirmación de Email:**
   - Busca la opción **"Confirm email"** o **"Enable email confirmations"**
   - **Desactívala** (toggle OFF)
   - Esto permitirá que los usuarios inicien sesión inmediatamente sin confirmar el email

5. **Guarda los cambios:**
   - Haz clic en **"Save"** o **"Update"**

### Configuración Recomendada para Desarrollo:

```
✅ Enable Email provider: ON
❌ Confirm email: OFF (deshabilitado)
✅ Secure email change: OFF (opcional, para desarrollo)
```

## 🔄 Alternativa: Confirmar Email Manualmente

Si prefieres mantener la confirmación de email habilitada, puedes confirmar usuarios manualmente:

### Desde Supabase Dashboard:

1. Ve a **Authentication** > **Users**
2. Busca el usuario que acabas de crear
3. Haz clic en los tres puntos (⋯) junto al usuario
4. Selecciona **"Send confirmation email"** o **"Confirm user"**

### Desde SQL Editor:

```sql
-- Confirmar email de un usuario específico
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'usuario@ejemplo.com';
```

## 🧪 Probar Después de Configurar

1. **Recarga la aplicación** en el navegador
2. Ve a `/registro`
3. Crea una nueva cuenta
4. Deberías poder iniciar sesión inmediatamente

## 📝 Notas Importantes

### Para Desarrollo:
- ✅ **Deshabilitar confirmación de email** es común y aceptable
- ✅ Facilita las pruebas y desarrollo
- ✅ Los usuarios pueden iniciar sesión inmediatamente

### Para Producción:
- ⚠️ **Habilitar confirmación de email** es recomendado
- ⚠️ Aumenta la seguridad
- ⚠️ Requiere configurar un servidor SMTP
- ⚠️ Los usuarios deben confirmar su email antes de iniciar sesión

## 🔧 Configurar SMTP (Para Producción)

Si quieres habilitar confirmación de email en producción:

1. Ve a **Authentication** > **Providers** > **Email**
2. Configura tu servidor SMTP:
   - **SMTP Host**: (ej: smtp.gmail.com)
   - **SMTP Port**: (ej: 587)
   - **SMTP User**: Tu email
   - **SMTP Password**: Tu contraseña de aplicación
3. Habilita **"Confirm email"**
4. Guarda los cambios

## ✅ Verificación

Después de deshabilitar la confirmación de email:

1. Crea un nuevo usuario desde `/registro`
2. Deberías poder iniciar sesión inmediatamente
3. No deberías ver el error "Email not confirmed"

---

**¿Listo?** Deshabilita la confirmación de email en Supabase Dashboard y prueba el registro nuevamente. 🚀

