# Rediseño de Footer, Tema y Paleta

## Objetivos
- Jerarquía visual clara y distribución lógica en el footer.
- Sistema de temas claro/oscuro con toggle accesible.
- Paleta profesional y consistente con accesibilidad AA.

## Footer
- Estructura: 4 columnas en desktop, 1 en móvil.
- Secciones: Marca, Enlaces, Recursos, Contacto.
- Minimal: solo copyright en páginas de producto.
- Archivo: `src/components/layout/Footer.tsx`.

## Tema
- Toggle en navbar (siempre visible): botón con iconos Sol/Luna.
- Persistencia en `localStorage` (`theme=dark|light`).
- Aplica clase `dark` en `document.documentElement`.
- Archivo: `src/components/layout/Header.tsx`.

## Paleta Global
- Claro:
  - `--primary: #522b46`, `--primary-foreground: #ffffff`
  - `--background: #ffffff`, `--foreground: #1b1f24`
  - `--muted: #f4f4f7`, `--muted-foreground: #6b6f76`
  - `--border: #e4e6ea`, `--ring: #522b46`
- Oscuro:
  - `--background: #0f1216`, `--foreground: #e6e7eb`
  - `--primary: #522b46`, `--primary-foreground: #ffffff`
  - `--muted: #1c212a`, `--border: #262c36`, `--ring: #8c5b9a`
- Archivo: `src/index.css`.

## Responsive
- Footer: `grid` con `md:grid-cols-4` y `gap-12`.
- Cabecera: barra centrada, búsqueda adaptable, botón de categorías.

## Uso
- Importar y usar `Footer` y `Header` desde `App.tsx`.
- Opcional: `minimal` para versiones reducidas.

## Accesibilidad
- Contraste AA mínimo garantizado por la paleta.
- Toggle con `aria-label` y estados visibles.

## Mantenimiento
- Variables centralizadas en `index.css`.
- Evitar hardcodear colores; usar tokens CSS.
