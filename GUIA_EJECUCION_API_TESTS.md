# 🚀 Guía Paso a Paso: Ejecutar Pruebas de API

## 📋 Requisitos Previos

1. **Node.js instalado** (versión 14 o superior)
2. **Postman instalado** (opcional, para interfaz gráfica)
3. **Newman CLI instalado** (para ejecución desde terminal)

---

## 📦 Paso 1: Instalar Newman

Abre PowerShell o Terminal y ejecuta:

```bash
npm install -g newman
npm install -g newman-reporter-html
```

**Verificar instalación:**
```bash
newman --version
```

Deberías ver algo como: `5.x.x`

---

## 📁 Paso 2: Verificar Archivos

Asegúrate de que existan estos archivos en la carpeta `postman/`:

```
postman/
├── E-Commerce-API-Tests.postman_collection.json
└── Supabase-Environment.postman_environment.json
```

**Verificar:**
```bash
ls postman/
```

---

## 🎯 Paso 3: Ejecutar Pruebas con Newman (Terminal)

### Opción A: Ejecución Básica

```bash
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json
```

### Opción B: Con Reporte HTML

```bash
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json -r html --reporter-html-export reports/api-report.html
```

### Opción C: Ejecutar Solo una Carpeta Específica

```bash
# Solo pruebas de Auth
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder "Auth"

# Solo pruebas de Products
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder "Products"
```

---

## 🖥️ Paso 4: Ejecutar con Postman (Interfaz Gráfica)

### 4.1 Importar Colección

1. Abre **Postman**
2. Click en **Import** (botón superior izquierdo)
3. Selecciona el archivo: `postman/E-Commerce-API-Tests.postman_collection.json`
4. Click en **Import**

### 4.2 Importar Environment

1. Click en **Import** nuevamente
2. Selecciona el archivo: `postman/Supabase-Environment.postman_environment.json`
3. Click en **Import**

### 4.3 Seleccionar Environment

1. Click en el dropdown de environments (arriba a la derecha)
2. Selecciona **"Supabase Environment"**

### 4.4 Ejecutar Colección

1. En el panel izquierdo, busca **"E-Commerce API Tests"**
2. Click en los **3 puntos** (...) junto al nombre
3. Selecciona **"Run collection"**
4. En la ventana que se abre:
   - Verifica que el environment sea **"Supabase Environment"**
   - Click en **"Run E-Commerce API Tests"**

### 4.5 Ver Resultados

- Verás los resultados en tiempo real
- ✅ Verde = Prueba exitosa
- ❌ Rojo = Prueba fallida
- Puedes ver detalles de cada request/response

---

## 📊 Paso 5: Interpretar Resultados

### Salida de Newman (Terminal)

```
newman

E-Commerce API Tests
┌─────────────────────────────────────────────────────────┐
│ Auth                                                     │
├─────────────────────────────────────────────────────────┤
│ A1 - Registro de Usuario                                │
│   ✓ Status code is 201                                 │
│   ✓ Response has user data                              │
│   ✓ Save token for next requests                        │
│                                                          │
│ A2 - Obtener Perfil                                     │
│   ✓ Status code is 200                                 │
│   ✓ Response has profile data                           │
└─────────────────────────────────────────────────────────┘
```

### Reporte HTML

Si ejecutaste con `-r html`, abre el archivo:
```
reports/api-report.html
```

En tu navegador verás un reporte visual completo.

---

## 🔧 Paso 6: Agregar Scripts a package.json (Opcional)

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "test:api": "newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json",
    "test:api:html": "newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json -r html --reporter-html-export reports/api-report.html",
    "test:api:auth": "newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder \"Auth\"",
    "test:api:products": "newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder \"Products\"",
    "test:api:cart": "newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder \"Cart\""
  }
}
```

Luego ejecuta:
```bash
npm run test:api
```

---

## ⚠️ Solución de Problemas

### Error: "newman: command not found"

**Solución:**
```bash
npm install -g newman
```

### Error: "Cannot find module"

**Solución:**
```bash
npm install -g newman-reporter-html
```

### Error: "Collection file not found"

**Solución:**
- Verifica que estés en el directorio raíz del proyecto
- Verifica que los archivos existan en `postman/`

### Error: "Environment file not found"

**Solución:**
- Verifica la ruta del archivo de environment
- Usa rutas relativas: `postman/Supabase-Environment.postman_environment.json`

### Error: "401 Unauthorized"

**Solución:**
- Verifica que `supabase_anon_key` esté correcto en el environment
- Verifica que el token de autenticación se haya guardado correctamente

### Error: "Connection refused" o "Network error"

**Solución:**
- Verifica que la URL base sea correcta
- Verifica tu conexión a internet
- Verifica que Supabase Edge Functions estén desplegadas

---

## 📝 Notas Importantes

1. **Orden de Ejecución**: Las pruebas están diseñadas para ejecutarse en orden:
   - Primero: Auth (registro y login)
   - Segundo: Products (necesita categorías)
   - Tercero: Cart (necesita productos y autenticación)

2. **Variables Automáticas**: 
   - `auth_token` se guarda automáticamente después del registro
   - `product_id` se guarda después de crear un producto
   - `category_id` se guarda después de listar categorías

3. **Timestamps**: Los emails de prueba usan `{{$timestamp}}` para evitar duplicados

4. **Autenticación**: Algunos endpoints requieren token (`auth_token`), otros son públicos

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Ejecutar todas las pruebas
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json

# Ejecutar con reporte HTML
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json -r html --reporter-html-export reports/api-report.html

# Ejecutar solo Auth
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder "Auth"

# Ejecutar solo Products
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder "Products"

# Ejecutar solo Cart
newman run postman/E-Commerce-API-Tests.postman_collection.json -e postman/Supabase-Environment.postman_environment.json --folder "Cart"
```

---

## ✅ Checklist de Ejecución

- [ ] Newman instalado (`newman --version`)
- [ ] Archivos de colección y environment en `postman/`
- [ ] Ejecutar comando básico de newman
- [ ] Verificar resultados en terminal
- [ ] (Opcional) Generar reporte HTML
- [ ] (Opcional) Ejecutar en Postman GUI

---

¡Listo! Ya puedes ejecutar las pruebas de API. 🚀

