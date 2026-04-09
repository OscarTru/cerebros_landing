# Landing Redesign — Fase 1 (Rediseño completo)

**Fecha:** 2026-04-09
**Proyecto:** Cerebros Esponjosos — Landing
**Stack objetivo:** Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Motion (Framer) + react-hook-form + zod

## Objetivo

Rediseñar por completo la landing actual (`src/App.tsx` monolítico con HeroUI) hacia una base elegante, editorial y mantenible. Primera fase de un rediseño mayor; esta fase entrega todas las secciones nuevas en un solo spec.

## Decisiones clave (alineadas con el usuario)

1. **Stack:** Se mantiene Vite (no migración a Next/Astro en esta fase).
2. **UI library:** Reemplazar HeroUI por **shadcn/ui** (Radix + copy-paste). HeroUI se elimina por completo del bundle.
3. **Tipografía:** **Instrument Serif** (display) + **Inter** (UI), ambas desde Google Fonts.
4. **Alcance:** Rediseño completo — todas las secciones nuevas.

## Arquitectura de código

```
src/
├── App.tsx                    # Composición de secciones (~30 líneas)
├── main.tsx
├── index.css                  # Tailwind v4 + @theme tokens + @import fuentes
├── content/
│   └── site.ts                # Datos tipados: founders, content links, copy
├── lib/
│   ├── utils.ts               # cn() (existente, mover desde src/utils.ts)
│   └── motion.ts              # Variantes reutilizables + LazyMotion config
├── components/
│   ├── ui/                    # shadcn primitives: button.tsx, card.tsx, input.tsx, sheet.tsx
│   ├── Nav.tsx                # Sticky nav con blur + progreso scroll
│   ├── AnimatedText.tsx       # Existente, mejorado (useScroll)
│   ├── FadeIn.tsx             # Extraído del archivo AnimatedText actual
│   └── NoiseOverlay.tsx       # Textura SVG fixed full-screen
└── sections/
    ├── Hero.tsx
    ├── Manifesto.tsx
    ├── Founders.tsx
    ├── Content.tsx            # Bento grid
    ├── Newsletter.tsx
    └── Footer.tsx
```

**Reglas de diseño de módulos:**
- Cada sección es un componente puro. Recibe datos desde `content/site.ts`.
- Sin estado global. Estado local solo en `Newsletter` (form state).
- Animaciones vía variantes en `lib/motion.ts`. `LazyMotion` con `domAnimation` envolviendo `App.tsx`.

## Design tokens (`src/index.css` — `@theme`)

```css
@theme {
  /* Colores */
  --color-bg: #0a0a0b;
  --color-surface: #111113;
  --color-surface-2: #17171a;
  --color-border: rgba(255,255,255,0.08);
  --color-border-strong: rgba(255,255,255,0.18);
  --color-text: #f4f4f5;
  --color-text-muted: #a1a1aa;
  --color-text-subtle: #52525b;
  --color-accent: #f4f4f5;

  /* Tipografía */
  --font-serif: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Escala modular 1.25 */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;
  --text-3xl: 2.75rem;
  --text-4xl: 3.75rem;
  --text-5xl: 5.5rem;
  --text-6xl: 7.5rem;

  /* Espaciado de secciones */
  --space-section: 8rem;
  --space-section-lg: 12rem;

  /* Radios */
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --radius-full: 9999px;
}
```

**Fondo global:** `--color-bg` sólido + `NoiseOverlay` SVG (opacity 0.03) `fixed inset-0 pointer-events-none` + gradiente radial muy tenue detrás del Hero.

**Fuentes:** `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap');` al inicio de `index.css`.

## Secciones

### Nav (`components/Nav.tsx`)
- Sticky top, `backdrop-blur-xl`, `border-b` que aparece solo al hacer scroll (vía `useScroll` de Motion).
- Izquierda: wordmark "Cerebros Esponjosos" en Instrument Serif.
- Derecha (desktop): anchors `Manifiesto · Nosotros · Contenido · Newsletter` en Inter 14px.
- Mobile: colapsa a shadcn `Sheet`.
- Indicador de progreso de scroll como `<motion.div>` 1px en el bottom.

### Hero (`sections/Hero.tsx`)
- Full viewport, centrado. Fondo: conic-gradient rotando 60s muy sutil.
- **Logo brain**: SVG preferido. Fallback: PNG existente con `mix-blend-mode: screen` para anular el fondo blanco. Sin el "orbe" negro con borde del diseño actual. Glow radial detrás reemplaza el círculo. Float animation `y: [0,-8,0]` 6s.
- **Eyebrow**: pill con punto pulsante verde + "Educación en neurología · ES".
- **Título**: Instrument Serif `clamp(3rem, 8vw, 7.5rem)`, line-height 0.95, tracking -0.03em. "Cerebros" en romano, "Esponjosos" en itálica + `--color-text-muted`.
- **Subcopy**: Inter 18px. "Convertimos la neurología en algo que puedes entender, recordar y aplicar."
- **CTAs**: primario blanco sólido "Conócenos" (scroll a Founders) + ghost "Ver último episodio ↗" (link externo YouTube).
- **Scroll hint**: línea vertical 1px animada descendiendo al fondo.

### Manifesto (`sections/Manifesto.tsx`)
- Sección dedicada, padding vertical generoso.
- Una frase editorial enorme, revelada palabra por palabra con `useScroll` + `useTransform` (cada palabra pasa de `opacity: 0.15` a `1` según progreso del scroll sobre la sección).
- **Copy:** *"Ciencia y vida real. Medicina y narrativa. Dos residentes pensando en voz alta para que la neurología deje de sentirse como un idioma ajeno."*
- Tipografía: Instrument Serif `clamp(2rem, 5vw, 4.5rem)`, line-height 1.15, max-w-5xl centrado. Palabras clave ("Ciencia", "vida real", "narrativa") en itálica.

### Founders (`sections/Founders.tsx`) — layout asimétrico
- Header: eyebrow "Quiénes somos" + título serif "Dos residentes, una conversación." alineados a la izquierda.
- **Bloque Stephanie (izq-der):**
  - Col izq (5/12): foto aspect 4/5, radio sutil, hover `translateY(-4px)`.
  - Col der (7/12): eyebrow "01 — Co-fundadora", nombre Instrument Serif 4xl, rol Inter mono uppercase 12px, bio Inter 16px line-height 1.7, max 55ch.
- **Bloque Oscar (der-izq):** espejo — foto derecha, texto izquierda.
- Separador: `<hr>` 1px `--color-border` ancho completo entre bloques.
- Bios vienen de `content/site.ts` — reusar el copy actual.

### Content (`sections/Content.tsx`) — Bento grid
- Header: eyebrow "Contenido" + título serif "El universo Cerebros Esponjosos." (izquierda).
- Grid 12 cols desktop / stack vertical mobile:

```
┌──────────────────────┬──────────────┐
│   YouTube (8 cols)   │  Podcast     │
│   row-span-2         │  (4 cols)    │
│                      ├──────────────┤
│   thumbnail + play   │  Instagram   │
│                      │  (4 cols)    │
└──────────────────────┴──────────────┘
┌──────────────────────────────────────┐
│   Blog (12 cols, row corta)          │
└──────────────────────────────────────┘
```

- **YouTube destacada:** aspect 16/9, thumbnail placeholder (`/public/assets/thumb-latest.jpg` — TODO en `content/site.ts` para integrar YouTube API después), overlay gradiente, título del episodio grande en serif, botón play circular flotante, hover scale 1.01.
- **Podcast:** icono Mic grande, título Inter semibold, desc muted, link "Escuchar ↗".
- **Instagram:** icono Camera, contador opcional (vacío), "Ver comunidad ↗".
- **Blog (row ancha):** icono BookOpen izq, título + desc centro, arrow derecha.
- Todas: `border --color-border`, `radius-md`, hover `border-strong` + `translateY(-2px)`. Sin glass-morphism.

### Newsletter (`sections/Newsletter.tsx`)
- Full-bleed, fondo `--color-surface` (separación sin bordes). Padding vertical generoso. Centrado.
- Eyebrow: "· El Privado ·" Inter mono uppercase 11px.
- Título Instrument Serif `clamp(2.5rem, 6vw, 5rem)` dos líneas: *"La gente no solo aprende."* / *"Se queda por cómo lo contamos."* (segunda línea itálica + muted).
- Subcopy Inter 16px max-w-xl: "Una vez a la semana. Sin ruido. Solo lo que de verdad vale la pena recordar."
- **Form:** `react-hook-form` + `zod`. Input pill-shaped con botón "Suscribirse" embebido a la derecha del mismo contenedor. Max-w-md.
- **Estados:** idle / loading (spinner) / success (checkmark + "Ya eres parte. Nos vemos el martes.") / error (borde rojo + mensaje).
- **Handler:** stub async `await new Promise(r => setTimeout(r, 800))` + return success. TODO comentario para integrar Beehiiv/Resend después.
- Fine print: "Cero spam. Te puedes salir cuando quieras."

### Footer (`sections/Footer.tsx`)
- **Top:** wordmark serif izquierda + columnas de links derecha (Contenido / Legal / Contacto).
- **Middle:** divisor + "Hecho con cuidado desde la residencia de neurología."
- **Bottom:** © 2026 Steph & Oscar · Términos · Privacidad · iconos sociales (YouTube, Instagram, Spotify) con `aria-label`.

## Flujo de datos

- `content/site.ts` exporta objetos tipados: `founders: Founder[]`, `contentLinks: ContentLink[]`, `navLinks`, `footerLinks`, `copy` (títulos, subtítulos).
- Cada sección importa lo que necesita. No props drilling.

## Error handling

- Newsletter form: validación client con zod (email válido), mensajes en español. Error de submit → banner rojo debajo del form con mensaje genérico.
- Imágenes: `onError` fallback a placeholder neutro.
- Nada más necesita manejo de errores en esta fase (no hay API reales).

## Accesibilidad

- `<html lang="es">`.
- Contraste AA: `#a1a1aa` sobre `#0a0a0b` = 8.9:1 ✓.
- `prefers-reduced-motion`: todas las animaciones Motion vía `useReducedMotion` retornan estado estático.
- Focus visible: ring 2px `--color-accent` en todos los interactivos.
- Iconos decorativos: `aria-hidden="true"`. Iconos que son links: `aria-label`.
- Nav keyboard-navigable, Sheet cerrable con Esc.

## Performance

- `LazyMotion` + `domAnimation` en `App.tsx` (reduce bundle Motion ~60%).
- `loading="lazy"` en imágenes excepto hero.
- Google Fonts con `display=swap`.
- `npm run build` debe reportar bundle principal menor al actual (HeroUI fuera).

## Testing

No hay suite configurada. Verificación manual al final de la implementación:

1. `npm run build` pasa sin errores ni warnings nuevos.
2. `npm run lint` limpio.
3. Revisión visual en `npm run dev`: cada sección renderiza, animaciones fluidas, responsive mobile/desktop, focus visible con teclado, Sheet del nav funciona en mobile.
4. Verificar que no quedan imports de `@heroui/react` en el código.

## Fuera de alcance (no en esta fase)

- Migración a Next.js / Astro.
- Integración real de YouTube API, newsletter backend, Spotify embed.
- Light mode.
- Tests automatizados.
- OG images dinámicas.
- CMS para bios/copy.

## Dependencias a añadir / quitar

**Añadir:**
- `@radix-ui/react-slot`, `class-variance-authority` (deps de shadcn)
- `@radix-ui/react-dialog` (para Sheet)
- `react-hook-form`, `zod`, `@hookform/resolvers`
- Reemplazo de `framer-motion` por `motion` (paquete nuevo unificado) — opcional, mantener `framer-motion` también es válido.

**Quitar:**
- `@heroui/react`, `@heroui/styles` y cualquier dep transitiva que solo use HeroUI.

## Criterios de éxito

- Todas las secciones del diseño implementadas y navegables.
- `App.tsx` < 50 líneas.
- Cero imports de HeroUI.
- Build y lint limpios.
- Logo brain visible con colores correctos (sin el fondo blanco actual ni grayscale).
- Lighthouse manual: performance > 90, a11y > 95.
