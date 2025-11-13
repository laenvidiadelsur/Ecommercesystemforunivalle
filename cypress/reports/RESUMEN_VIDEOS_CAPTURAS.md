# 📹 Resumen de Videos y Capturas de Pruebas Cypress

**Fecha de Ejecución:** 11 de Noviembre de 2025  
**Total de Pruebas Ejecutadas:** 19  
**Total de Videos Generados:** 4  
**Total de Capturas Generadas:** 13

---

## 🎬 Videos Generados

### 1. HU1-Registro-Usuario.cy.ts
- **Archivo:** `cypress/videos/HU1-Registro-Usuario.cy.ts.mp4`
- **Tamaño:** 3.74 MB
- **Duración:** ~39 segundos
- **Pruebas Incluidas:** 4
  - ✅ Debe permitir registrar un nuevo usuario como estudiante
  - ✅ Debe permitir registrar un nuevo usuario como vendedor
  - ✅ Debe validar que las contraseñas coincidan
  - ✅ Debe validar campos requeridos
- **Estado:** ✅ Todas las pruebas pasaron

### 2. HU1-Registro-Usuario.cy.ts (Ejecución adicional)
- **Archivo:** `cypress/videos/HU1-Registro-Usuario.cy.ts (1).mp4`
- **Tamaño:** 3.57 MB
- **Duración:** ~40 segundos
- **Estado:** ✅ Todas las pruebas pasaron

### 3. HU2-Busqueda-Productos.cy.ts
- **Archivo:** `cypress/videos/HU2-Busqueda-Productos.cy.ts.mp4`
- **Tamaño:** 0.72 MB
- **Duración:** ~2 segundos
- **Pruebas Incluidas:** 6
  - ❌ Debe mostrar el catálogo de productos (falló)
  - ❌ Debe permitir buscar productos por nombre (falló)
  - ✅ Debe permitir filtrar productos por categoría
  - ❌ Debe permitir ver detalles de un producto (falló)
  - ✅ Debe permitir ordenar productos
  - ❌ Debe mostrar información completa del producto en detalle (falló)
- **Estado:** ⚠️ 2 de 6 pruebas pasaron (4 fallaron)

### 4. HU3-Carrito-Compra.cy.ts
- **Archivo:** `cypress/videos/HU3-Carrito-Compra.cy.ts.mp4`
- **Tamaño:** 11.15 MB
- **Duración:** ~1 minuto 46 segundos
- **Pruebas Incluidas:** 9
  - ❌ Debe permitir agregar un producto al carrito desde el catálogo
  - ❌ Debe permitir agregar un producto al carrito desde la página de detalle
  - ❌ Debe mostrar el drawer del carrito al hacer clic en el ícono
  - ❌ Debe permitir seleccionar productos individualmente en el carrito
  - ❌ Debe permitir seleccionar todos los productos
  - ❌ Debe permitir modificar la cantidad de productos en el carrito
  - ❌ Debe permitir eliminar productos del carrito
  - ❌ Debe permitir proceder al checkout con productos seleccionados
  - ❌ Debe mostrar el total correcto de productos seleccionados
- **Estado:** ❌ 0 de 9 pruebas pasaron (todas fallaron)

---

## 📸 Capturas de Pantalla Generadas

### HU2: Búsqueda y Visualización de Productos (4 capturas)

1. **Debe mostrar el catálogo de productos (failed).png**
   - Ubicación: `cypress/screenshots/HU2-Busqueda-Productos.cy.ts/`
   - Error: Select.Item con valor vacío

2. **Debe permitir buscar productos por nombre (failed).png**
   - Ubicación: `cypress/screenshots/HU2-Busqueda-Productos.cy.ts/`
   - Error: Select.Item con valor vacío

3. **Debe permitir ver detalles de un producto (failed).png**
   - Ubicación: `cypress/screenshots/HU2-Busqueda-Productos.cy.ts/`
   - Error: Select.Item con valor vacío

4. **Debe mostrar información completa del producto en detalle (failed).png**
   - Ubicación: `cypress/screenshots/HU2-Busqueda-Productos.cy.ts/`
   - Error: Select.Item con valor vacío

### HU3: Gestión de Carrito y Proceso de Compra (9 capturas)

1. **Debe permitir agregar un producto al carrito desde el catálogo (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Select.Item con valor vacío

2. **Debe permitir agregar un producto al carrito desde la página de detalle (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Select.Item con valor vacío

3. **Debe mostrar el drawer del carrito al hacer clic en el ícono (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Select.Item con valor vacío

4. **Debe permitir seleccionar productos individualmente en el carrito (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Sintaxis `.or()` no válida en Cypress

5. **Debe permitir seleccionar todos los productos (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Sintaxis `.or()` no válida en Cypress

6. **Debe permitir modificar la cantidad de productos en el carrito (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Sintaxis `.or()` no válida en Cypress

7. **Debe permitir eliminar productos del carrito (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Sintaxis `.or()` no válida en Cypress

8. **Debe permitir proceder al checkout con productos seleccionados (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Sintaxis `.or()` no válida en Cypress

9. **Debe mostrar el total correcto de productos seleccionados (failed).png**
   - Ubicación: `cypress/screenshots/HU3-Carrito-Compra.cy.ts/`
   - Error: Sintaxis `.or()` no válida en Cypress

---

## 📊 Estadísticas Generales

| Métrica | Valor |
|---------|-------|
| **Total de Videos** | 4 |
| **Tamaño Total de Videos** | ~19.18 MB |
| **Total de Capturas** | 13 |
| **Pruebas Exitosas** | 6 |
| **Pruebas Fallidas** | 13 |
| **Tasa de Éxito** | 31.6% |

---

## 🔧 Correcciones Aplicadas

### 1. Error de Select.Item con valor vacío
- **Problema:** El componente Select de Radix UI no permite valores vacíos
- **Solución:** Cambiado el valor de `""` a `"all"` en el SelectItem de "Todas las categorías"
- **Archivo Corregido:** `src/pages/Catalog.tsx`

### 2. Error de sintaxis `.or()` en Cypress
- **Problema:** Cypress no tiene método `.or()`
- **Solución:** Reemplazado por `.should('satisfy', ...)` con lógica OR
- **Archivo Corregido:** `cypress/e2e/HU3-Carrito-Compra.cy.ts`

### 3. Configuración de Cypress
- **Agregado:** Manejo de excepciones no capturadas para errores de Select
- **Archivo:** `cypress.config.ts`

---

## 📁 Estructura de Archivos

```
cypress/
├── videos/
│   ├── HU1-Registro-Usuario.cy.ts.mp4 (3.74 MB)
│   ├── HU1-Registro-Usuario.cy.ts (1).mp4 (3.57 MB)
│   ├── HU2-Busqueda-Productos.cy.ts.mp4 (0.72 MB)
│   └── HU3-Carrito-Compra.cy.ts.mp4 (11.15 MB)
└── screenshots/
    ├── HU2-Busqueda-Productos.cy.ts/
    │   ├── Debe mostrar el catálogo de productos (failed).png
    │   ├── Debe permitir buscar productos por nombre (failed).png
    │   ├── Debe permitir ver detalles de un producto (failed).png
    │   └── Debe mostrar información completa del producto en detalle (failed).png
    └── HU3-Carrito-Compra.cy.ts/
        ├── Debe permitir agregar un producto al carrito desde el catálogo (failed).png
        ├── Debe permitir agregar un producto al carrito desde la página de detalle (failed).png
        ├── Debe mostrar el drawer del carrito al hacer clic en el ícono (failed).png
        ├── Debe permitir seleccionar productos individualmente en el carrito (failed).png
        ├── Debe permitir seleccionar todos los productos (failed).png
        ├── Debe permitir modificar la cantidad de productos en el carrito (failed).png
        ├── Debe permitir eliminar productos del carrito (failed).png
        ├── Debe permitir proceder al checkout con productos seleccionados (failed).png
        └── Debe mostrar el total correcto de productos seleccionados (failed).png
```

---

## ✅ Próximos Pasos

1. **Re-ejecutar pruebas** después de las correcciones aplicadas
2. **Revisar videos** para entender el flujo de las pruebas
3. **Analizar capturas** para identificar problemas visuales o de UI
4. **Corregir errores restantes** en las pruebas de HU2 y HU3

---

## 📝 Notas

- Todos los videos están en formato MP4
- Las capturas están en formato PNG (1280x720)
- Los videos se generan automáticamente para cada suite de pruebas
- Las capturas se generan solo cuando una prueba falla
- La configuración de Cypress está optimizada para generar videos y capturas de alta calidad

