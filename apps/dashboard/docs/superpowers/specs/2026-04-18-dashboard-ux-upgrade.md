# Dashboard UX Upgrade — Design Spec

**Date:** 2026-04-18
**Status:** Pending approval

---

## Goal

Elevar el dashboard actual de un estado "funcional y minimalista" a una herramienta premium, usable y moderna mediante:

1. **Sistema de componentes reutilizables** con variantes (Nivel C)
2. **Animaciones balanceadas** (Nivel B — evidentes pero elegantes)
3. **Rediseño de UX por página** que repiensa la estructura cuando aporta valor (Nivel B)
4. **Integración híbrida de librerías** (Nivel C): HeroUI como npm + copy-paste selectivo de animate-ui y reactbits

Este spec **NO agrega funcionalidades nuevas** (sync de redes, envío de newsletter, etc.). Es exclusivamente UX/UI polish. Las fases funcionales vienen después.

---

## Principios de diseño

- **Balance estético**: micro-interacciones evidentes pero no distraen. Cero efectos "demo" (partículas, magnetic buttons agresivos). Animaciones con propósito: guiar atención, dar feedback, suavizar transiciones.
- **Consistencia**: todas las páginas usan el mismo sistema de componentes. Ningún one-off.
- **Mantener la identidad existente**: `#0a0a0b` dark / `#f5f5f5` light, glassmorphism, bordes `rgba(255,255,255,0.08)`, Inter tight. No cambiamos paleta.
- **Progressive disclosure**: cada página muestra lo importante arriba, detalles debajo.
- **Light/dark parity**: todo componente debe verse bien en ambos modos desde el primer commit.

---

## Stack de librerías

### HeroUI (npm install)

```bash
npm install @heroui/react framer-motion
```

Componentes que usaremos:
- `Button` — reemplaza los `<button>` custom actuales
- `Input`, `Textarea` — reemplaza inputs del form de colaboraciones
- `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter` — para edición inline
- `Dropdown`, `DropdownTrigger`, `DropdownMenu`, `DropdownItem` — menús contextuales en cards
- `Tooltip` — info hover en íconos
- `Tabs`, `Tab` — tabs en Analytics
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableColumn` — reemplaza tablas actuales
- `Chip` — reemplaza los badges de estado
- `Popover` — filtros avanzados
- `Skeleton` — loading states
- `Avatar` — en listas de suscriptores/equipo
- `Progress` — barras de progreso (ej. % confirmados en newsletter)

`ClerkProvider` y `HeroUIProvider` deben coexistir en `app/layout.tsx`.

### animate-ui (copy-paste a `components/ui/`)

Componentes específicos que copiamos:

- `counting-number` — counter animado para MetricCard values
- `gradient-text` — opcional para welcome headings
- `text-shimmer` — loading states de texto
- `tabs` — si HeroUI tabs resulta insuficiente
- `sliding-number` — alternativa a counting-number para valores grandes

Ubicación: `apps/dashboard/components/ui/animate/`

### reactbits (copy-paste a `components/ui/`)

Efectos específicos:

- `FadeContent` — reveals al scroll o al mount
- `AnimatedList` — para listas (suscriptores, posts, colaboraciones) con stagger
- `StarBorder` — opcional, borde animado para destacar una card CTA
- `ClickSpark` — feedback al hacer click en botones importantes

Ubicación: `apps/dashboard/components/ui/effects/`

**Regla**: si una misma funcionalidad existe en HeroUI, animate-ui y reactbits, priorizar HeroUI (mantenible vía npm). Los otros dos son para efectos que HeroUI no tiene.

---

## Sistema de componentes base (`components/ui/`)

Creamos una capa de componentes reutilizables sobre HeroUI + utilities. **Todo con inline styles no permitidos** — solo Tailwind + HeroUI props.

### Primitivos básicos

| Componente | Responsabilidad | API |
|---|---|---|
| `<PageHeader>` | Header de página con título + subtítulo + slot para acciones | `title`, `subtitle?`, `actions?` |
| `<Section>` | Wrapper con heading uppercase consistente | `label`, `description?`, `children`, `action?` |
| `<EmptyState>` | Estado vacío con ícono + mensaje + CTA | `icon`, `title`, `description?`, `action?` |
| `<LoadingSkeleton>` | Skeletons preset para distintos contextos | `variant: "card" \| "table" \| "list" \| "chart"` |
| `<ChipStatus>` | Badge de estado con variantes semánticas | `status: "success" \| "warning" \| "error" \| "neutral" \| "info"`, `label` |
| `<DataTable>` | Tabla con sort, filter, empty state, loading | `columns`, `data`, `loading?`, `emptyState?` |
| `<PageTransition>` | Wrapper que anima entrada de página | `children` |

### Cards mejoradas (variantes)

| Componente | Uso |
|---|---|
| `<StatCard>` | Card de métrica con valor + label + ícono + trend opcional + micro-gráfico opcional |
| `<TrendCard>` | StatCard + sparkline de últimos 30 días (recharts) |
| `<ActionCard>` | Card clickeable que lleva a otra página (con hover animation) |
| `<InfoCard>` | Card neutral con heading + contenido libre |

### Layout

| Componente | Uso |
|---|---|
| `<TwoColumnLayout>` | Master-detail (ej. newsletter: lista + detalle) |
| `<FilterBar>` | Barra de filtros horizontal con chips |

### Animaciones wrappers

| Componente | Responsabilidad |
|---|---|
| `<AnimatedNumber>` | Wrapper del `counting-number` de animate-ui con theming |
| `<FadeIn>` | Wrapper del `FadeContent` de reactbits |
| `<StaggerList>` | Wrapper del `AnimatedList` de reactbits |

### Theming

HeroUI usa su propio sistema de themes. Creamos un theme que mapea a nuestros `--c-*` tokens:

```ts
// apps/dashboard/lib/heroui-theme.ts
import { heroui } from "@heroui/react"

export const cerebrosTheme = heroui({
  themes: {
    light: { colors: { background: "#f5f5f5", foreground: "#0a0a0b", /* ... */ } },
    dark: { colors: { background: "#0a0a0b", foreground: "#f4f4f5", /* ... */ } },
  },
})
```

El theme se aplica en `app/layout.tsx` via `<HeroUIProvider>` dentro de `<ClerkProvider>`. `ThemeProvider` de next-themes detecta `prefers-color-scheme`.

---

## Rediseño por página (UX-level)

### 1. Overview (/)

**Estructura actual**: 3 metric cards en grid.

**Estructura nueva**:
```
[PageHeader: "Bienvenido de vuelta, Oscar" + subtítulo]

[Quick Actions — 3 action cards horizontales]
  → "Nueva colaboración"
  → "Enviar newsletter"
  → "Preguntar a Claude"

[Grid 2x2 de TrendCards con sparklines]
  → Suscriptores (últimos 30 días)
  → Likes blog (últimos 30 días)
  → Colaboraciones activas (pipeline value total)
  → Engagement redes (placeholder hasta Fase 1 funcional)

[ActivityFeed — últimos 5 eventos]
  → "Nuevo suscriptor: alice@mail.com · hace 2h"
  → "Colaboración actualizada: Marca X → Confirmada · ayer"
  → etc. (lee de Supabase los últimos eventos de múltiples tablas)
```

**Animaciones**:
- Números en cards animados con `<AnimatedNumber>` al entrar la página
- Sparklines con reveal de izquierda a derecha
- Activity feed con stagger (cada item aparece 80ms después del anterior)

### 2. Analytics (/analytics)

**Estructura actual**: 3 secciones verticales (Instagram / YouTube / Blog).

**Estructura nueva**: Tabs horizontales con HeroUI `<Tabs>`.

```
[PageHeader: "Analytics" + subtítulo con fecha de última actualización]

[Tabs: Overview | Instagram | YouTube | Blog]

[Tab "Overview"]
  Grid 2x2 con top metric de cada plataforma

[Tab "Instagram"]
  StatCards (seguidores, engagement) + tabla de top posts

[Tab "YouTube"]
  StatCards (vistas, videos) + grid de videos top

[Tab "Blog"]
  StatCards (likes totales) + tabla de top posts (ya existe)
```

**Animaciones**:
- Transiciones entre tabs con fade+slide (HeroUI Tabs lo trae built-in)
- Cada tab panel usa `<FadeIn>` al activarse

### 3. Newsletter (/newsletter)

**Estructura actual**: Grid de 2 metric cards + tabla de suscriptores.

**Estructura nueva**: Master-detail con `<TwoColumnLayout>`.

```
[PageHeader: "Newsletter" + action "Exportar CSV"]

[Fila de 3 StatCards: Total / Confirmados / Confirmation rate]

[TwoColumnLayout]
  Izquierda (40%): Lista de suscriptores con search bar + FilterBar (Confirmados/Pendientes)
  Derecha (60%): Detalle del suscriptor seleccionado
    → Avatar, nombre, email
    → Fecha de suscripción, estado
    → Timeline de eventos (suscribió, confirmó, etc.)
    → Tags (manual, desde landing, etc.)
```

**Animaciones**:
- Lista con `<StaggerList>` al cargar
- Al seleccionar un suscriptor, el detalle fade in desde la derecha
- StatCards con counter animado

### 4. Colaboraciones (/colaboraciones)

**Estructura actual**: Kanban 4 columnas + botón "Nueva".

**Estructura nueva**: Vista dual con toggle + stats superiores.

```
[PageHeader: "Colaboraciones" + action "Nueva colaboración"]

[Fila de 4 StatCards]
  → Pipeline total (suma valor_mxn de no-cerradas)
  → Confirmadas este mes
  → Conversion rate
  → Ticket promedio

[Toggle: Kanban | Tabla]

[Kanban] — mejora del actual:
  - Drag & drop real entre columnas (framer-motion)
  - Hover en card muestra dropdown (Editar / Eliminar / Duplicar)
  - Column header con contador animado
  - Empty column muestra placeholder "Arrastra aquí"

[Tabla] — nueva vista:
  - DataTable con columnas: Marca / Tipo / Valor / Estado / Fecha
  - Sort por cualquier columna
  - Filtro por estado con chips
  - Click en fila abre modal de edición
```

**Animaciones**:
- Cards del Kanban con lift on hover (shadow más profunda, 2px arriba)
- Toggle Kanban↔Tabla con crossfade
- Drag & drop con spring physics

### 5. Colaboraciones/new (/colaboraciones/new)

**Estructura actual**: Form plano con labels encima.

**Estructura nueva**: Modal en lugar de página, o si mantener página → form con secciones.

**Decisión**: Mantener como página (más espacio para el form), pero con secciones visuales:

```
[PageHeader: "Nueva colaboración"]

[Card "Información básica"]
  Marca, Tipo, Estado (inputs HeroUI)

[Card "Detalles financieros"]
  Valor MXN, Fecha estimada

[Card "Contacto"]
  Nombre, email

[Card "Notas"]
  Textarea

[Fila de botones: Cancelar / Crear]
```

**Animaciones**:
- Cards aparecen con stagger
- Validation errors con shake animation (framer-motion)

### 6. Contenido (/contenido)

**Estructura actual**: Tabla simple.

**Estructura nueva**: Grid con toggle de vista + filtros.

```
[PageHeader: "Contenido" + stats (N posts, total likes)]

[FilterBar]
  Search input | Sort (Más likes / Más reciente / Alfabético) | View toggle (Grid | Table)

[Grid view — default]
  Cards 3-columnas mostrando: título, slug, fecha, likes
  Hover muestra botón "Ver en sitio"

[Table view]
  DataTable con las mismas columnas
```

**Animaciones**:
- Cards con `<StaggerList>`
- Hover de card con lift
- Toggle Grid↔Table con crossfade

### 7. Agentes IA (/agentes)

**Estructura actual**: Chat simple con sugerencias.

**Estructura nueva**: Layout con sidebar lateral + área de chat.

```
[PageHeader: "Agentes IA"]

[TwoColumnLayout]
  Izquierda (25%): Sidebar con
    - Botón "Nueva conversación"
    - Lista de conversaciones anteriores (fecha + primer mensaje truncado)
    - Separador
    - Presets (cards pequeñas): "Análisis semanal", "Estrategia de contenido", "Review de colaboraciones"

  Derecha (75%): Área de chat
    - Mensajes con burbujas
    - Input al fondo con sugerencias contextuales
    - Indicador de typing cuando Claude responde
```

**Nota**: El backend para historial de conversaciones **no se implementa en este spec**. Se muestra UI con datos mock. La integración real es parte de la Fase 5 funcional.

**Animaciones**:
- Mensajes nuevos aparecen con fade+slide desde abajo
- Typing indicator con bounce dots
- Sidebar selection con spring

### 8. Equipo (/equipo)

**Estructura actual**: Clerk `<OrganizationProfile>` embebido.

**Estructura nueva**: Wrapper custom con mejor integración visual.

```
[PageHeader: "Equipo" + action "Invitar miembro"]

[Tabs: Miembros | Invitaciones pendientes | Configuración]

[Miembros]
  Grid de Avatar cards: foto, nombre, rol, acciones dropdown

[Invitaciones]
  Lista con estado y botón re-enviar
```

**Nota**: Esto requiere **no usar** el `<OrganizationProfile>` completo de Clerk y en su lugar usar las APIs de Clerk para listar miembros manualmente. Es más trabajo pero da control total de UI.

**Decisión**: Mantener `<OrganizationProfile>` pero estilizarlo más (cambiar colores, espaciados) vía el prop `appearance`. Full custom UI va a Fase funcional.

**Animaciones**:
- Cards de miembros con hover lift
- Tabs con crossfade

---

## Dark/Light mode

Todo debe funcionar en ambos modos sin flicker:

- HeroUI provider detecta `prefers-color-scheme` vía `next-themes`
- `<ClickSpark>` y otros efectos usan `currentColor` o `var(--c-*)` en lugar de hex
- Sparklines (recharts) leen tokens via CSS variables

---

## Dependencies a agregar

```json
{
  "dependencies": {
    "@heroui/react": "^2.6.0",
    "framer-motion": "^11.11.0",
    "next-themes": "^0.4.0",
    "recharts": "^2.13.0"
  }
}
```

`recharts` es la única librería de charts. Los sparklines del Overview y tendencias del Analytics la usan.

---

## File structure nuevo

```
apps/dashboard/
├── components/
│   ├── ui/
│   │   ├── PageHeader.tsx
│   │   ├── Section.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ChipStatus.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageTransition.tsx
│   │   ├── StatCard.tsx
│   │   ├── TrendCard.tsx
│   │   ├── ActionCard.tsx
│   │   ├── InfoCard.tsx
│   │   ├── TwoColumnLayout.tsx
│   │   ├── FilterBar.tsx
│   │   ├── animate/
│   │   │   ├── AnimatedNumber.tsx  (wraps counting-number)
│   │   │   ├── GradientText.tsx
│   │   │   └── TextShimmer.tsx
│   │   └── effects/
│   │       ├── FadeIn.tsx  (wraps FadeContent)
│   │       ├── StaggerList.tsx  (wraps AnimatedList)
│   │       └── ClickSpark.tsx
│   ├── Sidebar.tsx  (refactor)
│   ├── Header.tsx  (refactor)
│   ├── KanbanBoard.tsx  (refactor con drag&drop real)
│   ├── KanbanCard.tsx  (refactor)
│   ├── AgentesClient.tsx  (refactor con sidebar)
│   ├── NuevaColaboracionClient.tsx  (refactor con secciones)
│   └── MetricCard.tsx  (deprecado, usar StatCard)
├── lib/
│   └── heroui-theme.ts  (nuevo)
└── app/
    ├── layout.tsx  (agrega HeroUIProvider + ThemeProvider)
    └── (dashboard)/
        └── [todas las páginas refactorizadas]
```

---

## Qué NO cambia

- Backend / APIs existentes (`/api/colaboraciones`, `/api/agentes/analiza`)
- Tablas Supabase
- Clerk auth / middleware
- Queries a BD (solo cambia presentación)
- Monorepo structure
- Tailwind config

---

## Qué queda fuera de scope (para fases futuras)

- Sincronización real de Instagram/YouTube (mock por ahora)
- Envío real de newsletter desde dashboard
- Edición de suscriptores
- Drag & drop entre columnas Kanban con persistencia (solo UI)
- Historial real de conversaciones de Agentes IA
- Calendario editorial de contenido
- Notificaciones push/email

Todo eso va en Fase 1-5 funcionales **después** de este UX upgrade.

---

## Success criteria

1. Todas las páginas usan el sistema de componentes (`components/ui/`), cero inline styles custom
2. HeroUI instalado y funcionando con theme custom en light+dark
3. Al menos 5 animaciones visibles y con propósito (counter, stagger, fadeIn, hover lift, page transition)
4. Navegación entre páginas con transiciones suaves
5. Loading skeletons en todas las páginas async
6. Empty states en listas vacías (newsletter, colaboraciones, contenido)
7. Dark/light mode perfecto en toda página y componente
8. `npm run build` pasa sin errores
9. Performance: Lighthouse score > 90 en dev, first contentful paint < 2s
10. Tamaño de bundle del dashboard no aumenta más de 30% respecto al actual (~500KB gzipped máx)
