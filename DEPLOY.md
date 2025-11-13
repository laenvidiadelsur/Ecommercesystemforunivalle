# 🚀 Guía de Despliegue - E-commerce System for Univalle

Esta guía te ayudará a desplegar la aplicación en diferentes plataformas.

## 📋 Prerequisitos

- ✅ Node.js instalado (versión 18 o superior)
- ✅ Cuenta en la plataforma de despliegue elegida
- ✅ Proyecto de Supabase configurado (ya está configurado en el código)

## 🔧 Configuración Actual

La aplicación ya está configurada con:
- **Supabase Project ID**: `utrqrjvxfpxyvrgxslet`
- **Supabase URL**: `https://utrqrjvxfpxyvrgxslet.supabase.co`
- **Edge Function**: `make-server-7ff09ef6`

Las credenciales están hardcodeadas en `src/utils/supabase/info.tsx`. Si necesitas cambiarlas, edita ese archivo.

## 🌐 Opciones de Despliegue

### Opción 1: Vercel (Recomendado)

Vercel es la plataforma más popular para aplicaciones React/Vite.

#### Pasos:

1. **Instalar Vercel CLI** (opcional, también puedes usar la interfaz web):
   ```bash
   npm i -g vercel
   ```

2. **Desplegar desde la terminal**:
   ```bash
   vercel
   ```
   Sigue las instrucciones en pantalla.

3. **O desplegar desde GitHub**:
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración de Vite
   - Haz clic en "Deploy"

4. **Configuración automática**:
   - El archivo `vercel.json` ya está configurado
   - Vercel detectará automáticamente:
     - Build command: `npm run build`
     - Output directory: `build`
     - Framework: Vite

5. **Variables de entorno** (si las necesitas en el futuro):
   - Ve a Settings > Environment Variables
   - Agrega las variables necesarias

#### URL de producción:
Después del despliegue, obtendrás una URL como: `https://tu-proyecto.vercel.app`

---

### Opción 2: Netlify

Netlify es otra excelente opción para aplicaciones estáticas.

#### Pasos:

1. **Instalar Netlify CLI** (opcional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Desplegar desde la terminal**:
   ```bash
   netlify deploy --prod
   ```

3. **O desplegar desde GitHub**:
   - Ve a [netlify.com](https://netlify.com)
   - Conecta tu repositorio
   - Netlify detectará automáticamente la configuración
   - El archivo `netlify.toml` ya está configurado

4. **Configuración**:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Ya configurado en `netlify.toml`

---

### Opción 3: GitHub Pages

Para desplegar en GitHub Pages:

1. **Instalar gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Agregar script al package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. **Desplegar**:
   ```bash
   npm run deploy
   ```

4. **Configurar en GitHub**:
   - Ve a Settings > Pages
   - Selecciona la rama `gh-pages` como fuente

---

### Opción 4: Supabase Hosting

Supabase también ofrece hosting para aplicaciones estáticas.

#### Pasos:

1. **Instalar Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Iniciar sesión**:
   ```bash
   supabase login
   ```

3. **Desplegar**:
   ```bash
   supabase hosting deploy build --project-ref utrqrjvxfpxyvrgxslet
   ```

---

## 🧪 Probar el Build Localmente

Antes de desplegar, puedes probar el build localmente:

```bash
npm run build
npm run preview
```

Esto iniciará un servidor local en `http://localhost:4173` con la versión de producción.

## ✅ Verificación Post-Despliegue

Después de desplegar, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ El login/registro funciona
3. ✅ Las peticiones a Supabase funcionan
4. ✅ El catálogo de productos se muestra
5. ✅ El carrito funciona

## 🔐 Notas de Seguridad

- Las credenciales de Supabase están en el código del cliente (esto es normal para la clave anónima)
- La clave anónima (`publicAnonKey`) es segura para exponer en el cliente
- Las políticas RLS (Row Level Security) en Supabase protegen los datos del servidor

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Build failed"
- Verifica que todas las dependencias estén instaladas
- Revisa los errores en la consola
- Asegúrate de que el proyecto compile localmente primero

### Error: "404 en rutas"
- Verifica que el archivo `vercel.json` o `netlify.toml` esté configurado correctamente
- Asegúrate de que las redirecciones estén configuradas para SPA (Single Page Application)

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de la plataforma de despliegue
2. Verifica que Supabase esté configurado correctamente
3. Asegúrate de que el build local funcione antes de desplegar

---

## 🎉 ¡Listo!

Tu aplicación debería estar desplegada y funcionando. Si necesitas ayuda adicional, consulta la documentación de la plataforma elegida.

