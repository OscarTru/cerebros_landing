# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Type-check + build for production (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test suite is configured.

## Architecture

Single-page landing site for **Cerebros Esponjosos** — a Spanish-language neurology education brand by two neurology residents (Oscar & Stephanie).

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + HeroUI v3 + Framer Motion

**Key layout:** All content lives in a single `src/App.tsx` file structured as sequential `<section>` elements:
1. Hero — floating brain logo, animated tagline, CTA button
2. About — founder bios (Stephanie & Oscar) in a 2-column card grid
3. Content links — YouTube, Podcast, Instagram, Blog link buttons
4. Newsletter — email signup form
5. Footer

**Path alias:** `@/` maps to `src/` (configured in `vite.config.ts`).

**Shared components** (`src/components/ui/`):
- `AnimatedText` — word-by-word reveal animation using Framer Motion `whileInView`
- `FadeIn` — fade-up wrapper with configurable `delay` prop

**Utility:** `src/utils.ts` exports `cn()` (clsx + tailwind-merge).

**Styling approach:** Tailwind v4 with `@theme` custom variables in `src/index.css`. Design language is dark/premium: `#030712` base, zinc palette, glass-morphism cards (`bg-zinc-900/40 backdrop-blur-xl`), white glows/gradients. Font stack uses SF Pro Display via CSS variable `--font-heading`.

**HeroUI usage:** `Button`, `Card`, `Card.Content`, `Input` from `@heroui/react`. Styles imported globally via `@import "@heroui/styles"` in `index.css`.

**Static assets:** `/public/assets/brain.png` is the hero logo image.
