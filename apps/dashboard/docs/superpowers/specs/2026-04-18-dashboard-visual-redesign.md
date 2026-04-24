# Dashboard Visual Redesign — Design Spec

**Date:** 2026-04-18  
**Status:** Approved

---

## Goal

Redesign the `apps/dashboard` visual layer to match the premium aesthetic of the `apps/web` landing site — glassmorphism cards, radial ambient glows, tight Inter typography, and full light/dark mode that follows the OS preference automatically (`prefers-color-scheme`). No external UI libraries (no Shadcn, no animate-ui, no HeroUI).

---

## Design Principles

- **Same tokens, same feel**: Reuse the `--c-*` CSS custom property system already defined in `globals.css`. Light and dark variants are defined via `prefers-color-scheme`, not a class toggle.
- **Glassmorphism**: Cards and sidebar use `background: rgba(...)` + `backdrop-filter: blur()` + `border: 1px solid rgba(...)` — never solid opaque fills.
- **Radial glows**: Subtle `radial-gradient` pseudo-elements or inline divs create ambient light on cards and page backgrounds, matching the Hero section of the landing.
- **Typography**: Inter for all UI text. `letter-spacing: -0.02em` on display headings. `font-weight: 600` for page titles, `500` for labels, `400` for body. No Instrument Serif in the dashboard (that's for editorial landing content).
- **Monochrome accent**: Active nav item = white fill + black text (dark mode) / black fill + white text (light mode). No color accents (no purple, no teal).
- **No external UI libs**: All components are handwritten with Tailwind v4 utility classes and CSS custom properties.

---

## Color Tokens

Defined in `apps/dashboard/app/globals.css`. Two sets — one for dark (current default), one for light — both under `:root` with `@media (prefers-color-scheme: light)` override. The `className="dark"` on `<html>` in layout.tsx must be **removed** — mode is OS-driven.

### Dark (default)
```css
:root {
  --c-bg: #0a0a0b;
  --c-surface: rgba(255, 255, 255, 0.04);
  --c-surface-2: rgba(255, 255, 255, 0.07);
  --c-surface-3: rgba(255, 255, 255, 0.02);
  --c-border: rgba(255, 255, 255, 0.08);
  --c-border-strong: rgba(255, 255, 255, 0.16);
  --c-text: #f4f4f5;
  --c-text-muted: #a1a1aa;
  --c-text-subtle: #71717a;
  --c-text-faint: #3f3f46;
  --c-invert: #ffffff;
  --c-invert-fg: #000000;
  --c-glow: rgba(255, 255, 255, 0.06);
  --c-accent: rgba(255, 255, 255, 0.9);
}
```

### Light (override)
```css
@media (prefers-color-scheme: light) {
  :root {
    --c-bg: #fafafa;
    --c-surface: rgba(0, 0, 0, 0.03);
    --c-surface-2: rgba(0, 0, 0, 0.06);
    --c-surface-3: rgba(0, 0, 0, 0.015);
    --c-border: rgba(0, 0, 0, 0.08);
    --c-border-strong: rgba(0, 0, 0, 0.16);
    --c-text: #0a0a0b;
    --c-text-muted: #52525b;
    --c-text-subtle: #71717a;
    --c-text-faint: #d4d4d8;
    --c-invert: #0a0a0b;
    --c-invert-fg: #ffffff;
    --c-glow: rgba(0, 0, 0, 0.04);
    --c-accent: rgba(0, 0, 0, 0.85);
  }
}
```

---

## Component Redesigns

### `Sidebar`
- Width: `w-56` (224px)
- Background: `var(--c-surface)` + `backdrop-filter: blur(12px)` + right border `var(--c-border)`
- Top section: logo square (24×24, `var(--c-invert)` fill) + "Cerebros Esponjosos" in `text-xs font-semibold` + "Dashboard" in `text-[10px] text-[var(--c-text-subtle)]`
- Nav items: icon (16×16, `lucide-react`) + label text `text-sm`
  - **Active**: `bg-[var(--c-invert)] text-[var(--c-invert-fg)]` rounded-lg — white pill in dark, black pill in light
  - **Inactive**: `text-[var(--c-text-muted)]` hover → `bg-[var(--c-surface-2)] text-[var(--c-text)]`
- Bottom: `UserButton` from Clerk + display name in `text-xs text-[var(--c-text-subtle)]`, separated by top border `var(--c-border)`
- Ambient glow: absolute `div` with `radial-gradient(circle, var(--c-glow) 0%, transparent 65%)` at top-left, `pointer-events:none`

### `Header`
- Height: `h-14`
- Background: `var(--c-bg)` (transparent feel, not a glass card)
- Bottom border: `border-b border-[var(--c-border)]`
- Left: page `<h1>` in `text-sm font-semibold tracking-tight text-[var(--c-text)]`
- Right: `UserButton` from Clerk

### `MetricCard`
- Background: `var(--c-surface)`
- Border: `border border-[var(--c-border)]`
- Border radius: `rounded-xl`
- Padding: `p-5`
- Icon container: `p-2 bg-[var(--c-surface-2)] border border-[var(--c-border)] rounded-lg`
- Label: `text-[10px] font-medium uppercase tracking-widest text-[var(--c-text-subtle)]`
- Value: `text-2xl font-semibold tracking-tight text-[var(--c-text)]`
- Sublabel: `text-xs text-[var(--c-text-faint)]`
- Ambient glow: absolute pseudo-element top-right corner, `radial-gradient(circle, var(--c-glow) 0%, transparent 70%)`
- Trend: green (`#10b981`) for positive, red (`#ef4444`) for negative — these are semantic colors, not accents

### `KanbanCard`
- Background: `var(--c-surface)`
- Border: `border border-[var(--c-border)]`
- Border radius: `rounded-lg`
- Hover: `border-[var(--c-border-strong)]` transition
- Status badge: small pill, `bg-[var(--c-surface-2)] text-[var(--c-text-muted)] text-[10px]`

### `KanbanBoard`
- Column headers: `text-xs font-medium uppercase tracking-widest text-[var(--c-text-subtle)]`
- Column background: `var(--c-surface-3)` with `rounded-xl border border-[var(--c-border)]`

---

## Layout

```
┌─────────────────────────────────────────────┐
│  Sidebar (w-56, sticky, h-screen)           │
│  ┌───────────────────────────────────────┐  │
│  │  [logo] Cerebros Esponjosos           │  │
│  │         Dashboard                     │  │
│  ├───────────────────────────────────────┤  │
│  │  [icon] Overview         ← active    │  │
│  │  [icon] Analytics                    │  │
│  │  [icon] Newsletter                   │  │
│  │  [icon] Colaboraciones               │  │
│  │  [icon] Contenido                    │  │
│  │  [icon] Agentes IA                   │  │
│  │  [icon] Equipo                       │  │
│  ├───────────────────────────────────────┤  │
│  │  [avatar] Oscar T.                   │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  Main (flex-1)                              │
│  ┌─ Header ──────────────────────────────┐  │
│  │  Overview                  [UserBtn]  │  │
│  └───────────────────────────────────────┘  │
│  ┌─ Page content (p-6) ──────────────────┐  │
│  │  Bienvenido de vuelta                 │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐         │  │
│  │  │ Card │ │ Card │ │ Card │         │  │
│  │  └──────┘ └──────┘ └──────┘         │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Files to Change

| File | Change |
|------|--------|
| `app/globals.css` | Add `@media (prefers-color-scheme: light)` block with light tokens. Remove `.dark` class block. |
| `app/layout.tsx` | Remove `className="dark"` from `<html>`. |
| `components/Sidebar.tsx` | Apply glassmorphism, ambient glow, refined nav styles, user bottom section. |
| `components/Header.tsx` | Simplify background, tighten typography. |
| `components/MetricCard.tsx` | Add ambient glow, tighten label/value typography, refined icon container. |
| `components/KanbanCard.tsx` | Glassmorphism border, hover state. |
| `components/KanbanBoard.tsx` | Column header typography, column background token. |

No new files created. No dependencies added.

---

## What Does NOT Change

- Routing, auth, data fetching — untouched
- Component props/interfaces — same API
- Supabase queries
- Clerk configuration
- `packages/lib`, `packages/ui`

---

## Success Criteria

1. Dashboard looks visually consistent with the landing (`apps/web`)
2. Light mode (white bg, black accents) works correctly when OS is in light mode
3. Dark mode (black bg, white accents) works correctly when OS is in dark mode
4. No flicker on load (no class-based toggle, pure CSS media query)
5. `npm run build --workspace=apps/dashboard` passes with zero errors
