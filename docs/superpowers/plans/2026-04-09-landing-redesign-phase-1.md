# Landing Redesign Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar por completo la landing de Cerebros Esponjosos con nueva arquitectura de código, design tokens, tipografía editorial (Instrument Serif + Inter), shadcn/ui reemplazando HeroUI, y todas las secciones (Nav, Hero, Manifesto, Founders, Content bento, Newsletter, Footer).

**Architecture:** Vite + React 19 + TypeScript + Tailwind v4 (`@theme` tokens) + shadcn/ui primitives + Motion (framer-motion) con LazyMotion + react-hook-form + zod. `App.tsx` pasa a ser composición (~30 líneas). Secciones aisladas en `src/sections/`, datos en `src/content/site.ts`, variantes de animación en `src/lib/motion.ts`.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 4, framer-motion 12, shadcn/ui (Radix + CVA), lucide-react, react-hook-form 7, zod 3.

**Important context for the implementer:**
- Repo is **not a git repository** (`Is a git repository: false`). Where the plan says "commit", run `git status` — if not a repo, skip the commit step and just move on. Do not run `git init` unless the user asks.
- No test suite is configured. Verification per task is: (a) `npm run build` passes, (b) `npm run lint` passes, (c) manual visual check in `npm run dev` as applicable. No fabricated unit tests.
- Spec: `docs/superpowers/specs/2026-04-09-landing-redesign-phase-1-design.md`.
- Tailwind v4 uses `@theme` directive in CSS — no `tailwind.config.js`.
- Path alias `@/` → `src/` is already configured in `vite.config.ts`.
- Current monolith to replace: `src/App.tsx`.
- Brain logo at `/public/assets/brain.png` has a white background. Current workaround already applied: `mixBlendMode: "screen"`. Keep that technique in the new Hero unless an SVG is later provided.
- Founder photos exist: `/public/assets/stephanie.png`, `/public/assets/oscar.png`.

---

## File Structure

**Create:**
- `src/lib/utils.ts` (move from `src/utils.ts`)
- `src/lib/motion.ts`
- `src/content/site.ts`
- `src/components/ui/button.tsx` (shadcn)
- `src/components/ui/card.tsx` (shadcn)
- `src/components/ui/input.tsx` (shadcn)
- `src/components/ui/sheet.tsx` (shadcn)
- `src/components/Nav.tsx`
- `src/components/FadeIn.tsx`
- `src/components/AnimatedText.tsx` (replace existing in `src/components/ui/`)
- `src/components/NoiseOverlay.tsx`
- `src/sections/Hero.tsx`
- `src/sections/Manifesto.tsx`
- `src/sections/Founders.tsx`
- `src/sections/Content.tsx`
- `src/sections/Newsletter.tsx`
- `src/sections/Footer.tsx`

**Modify:**
- `package.json` (remove HeroUI, add shadcn deps)
- `src/index.css` (new tokens, fonts, remove HeroUI import)
- `src/App.tsx` (composition only, ~30 lines)
- `index.html` (`lang="es"`, meta description, OG tags)

**Delete:**
- `src/utils.ts` (moved to `src/lib/utils.ts`)
- `src/components/ui/AnimatedText.tsx` (moved to `src/components/AnimatedText.tsx`)

---

## Task 1: Dependency swap — remove HeroUI, add shadcn + form stack

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Uninstall HeroUI**

Run:
```bash
npm uninstall @heroui/react @heroui/styles
```

- [ ] **Step 2: Install new dependencies**

Run:
```bash
npm install @radix-ui/react-slot @radix-ui/react-dialog class-variance-authority react-hook-form zod @hookform/resolvers
```

- [ ] **Step 3: Verify install succeeded**

Run: `npm run build`
Expected: the build will **fail** because `App.tsx` still imports from `@heroui/react`. That's fine for this task — we just need `node_modules` resolved. Confirm the failure is ONLY about `@heroui/react` imports, not about the newly-added packages.

- [ ] **Step 4: Snapshot**

If repo is a git repo: `git add package.json package-lock.json && git commit -m "chore: swap HeroUI for shadcn + form stack deps"`
If not: skip, continue.

---

## Task 2: Design tokens and fonts in `index.css`

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Rewrite `src/index.css` with new tokens**

Replace the entire file contents with:

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');
@import "tailwindcss";

@theme {
  /* Colores */
  --color-bg: #0a0a0b;
  --color-surface: #111113;
  --color-surface-2: #17171a;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-strong: rgba(255, 255, 255, 0.18);
  --color-text: #f4f4f5;
  --color-text-muted: #a1a1aa;
  --color-text-subtle: #52525b;
  --color-accent: #f4f4f5;

  /* Tipografía */
  --font-serif: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Escala tipográfica modular 1.25 */
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

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify CSS does not depend on HeroUI**

Run: `grep -n "@heroui" src/index.css`
Expected: no output.

---

## Task 3: Move `src/utils.ts` → `src/lib/utils.ts`

**Files:**
- Create: `src/lib/utils.ts`
- Delete: `src/utils.ts`

- [ ] **Step 1: Create `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Delete old file**

Run: `rm src/utils.ts`

- [ ] **Step 3: Update imports across the repo**

Run: `grep -rn "@/utils" src/` to find all import sites.
For each file found, replace `@/utils` with `@/lib/utils`. (Currently only `src/components/ui/AnimatedText.tsx` — that file will be deleted in Task 5, but update it anyway so the build is consistent if tasks run out of order.)

---

## Task 4: Motion utilities (`src/lib/motion.ts`)

**Files:**
- Create: `src/lib/motion.ts`

- [ ] **Step 1: Create file**

```ts
import type { Variants } from "framer-motion"

// Easing curves
export const easeOut = [0.16, 1, 0.3, 1] as const

// Reusable variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easeOut } },
}

export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const viewportOnce = { once: true, margin: "-10%" } as const
```

---

## Task 5: Shared components — FadeIn, AnimatedText, NoiseOverlay

**Files:**
- Create: `src/components/FadeIn.tsx`
- Create: `src/components/AnimatedText.tsx`
- Create: `src/components/NoiseOverlay.tsx`
- Delete: `src/components/ui/AnimatedText.tsx`

- [ ] **Step 1: Create `src/components/FadeIn.tsx`**

```tsx
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { fadeUp, viewportOnce } from "@/lib/motion"

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/components/AnimatedText.tsx`**

```tsx
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function AnimatedText({
  text,
  className,
  as: Tag = "h2",
}: {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
}) {
  const words = text.split(" ")
  const MotionTag = motion[Tag]

  return (
    <MotionTag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="mr-[0.25em] inline-block"
          variants={{
            hidden: { y: "100%", opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          transition={{
            duration: 0.7,
            delay: i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  )
}
```

- [ ] **Step 3: Create `src/components/NoiseOverlay.tsx`**

```tsx
export function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}
```

- [ ] **Step 4: Delete the old AnimatedText**

Run: `rm src/components/ui/AnimatedText.tsx`

---

## Task 6: shadcn primitives — Button

**Files:**
- Create: `src/components/ui/button.tsx`

- [ ] **Step 1: Create file**

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
  {
    variants: {
      variant: {
        primary:
          "bg-white text-black hover:bg-zinc-200",
        ghost:
          "bg-transparent text-white hover:bg-white/5 border border-white/10 hover:border-white/20",
        subtle:
          "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full",
        md: "h-11 px-6 text-sm rounded-full",
        lg: "h-14 px-8 text-base rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { buttonVariants }
```

---

## Task 7: shadcn primitives — Card

**Files:**
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: Create file**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-white/[0.08] bg-[#111113] transition-all hover:border-white/[0.18] hover:-translate-y-0.5",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8", className)} {...props} />
))
CardContent.displayName = "CardContent"
```

---

## Task 8: shadcn primitives — Input

**Files:**
- Create: `src/components/ui/input.tsx`

- [ ] **Step 1: Create file**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-12 w-full rounded-full bg-black/40 border border-white/10 px-5 text-sm text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"
```

---

## Task 9: shadcn primitives — Sheet (mobile nav)

**Files:**
- Create: `src/components/ui/sheet.tsx`

- [ ] **Step 1: Create file**

```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = "SheetOverlay"

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-50 h-full w-3/4 max-w-sm border-l border-white/10 bg-[#0a0a0b] p-8 shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-6 top-6 text-zinc-400 hover:text-white">
        <X className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Cerrar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = "SheetContent"
```

---

## Task 10: Site content (`src/content/site.ts`)

**Files:**
- Create: `src/content/site.ts`

- [ ] **Step 1: Create file**

```ts
import { Tv, Mic, Camera, BookOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Founder {
  id: string
  name: string
  role: string
  photo: string
  bio: string
  orderLabel: string
}

export interface ContentLink {
  id: string
  icon: LucideIcon
  title: string
  description: string
  href: string
  cta: string
  featured?: boolean
}

export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: "Manifiesto", href: "#manifiesto" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contenido", href: "#contenido" },
  { label: "Newsletter", href: "#newsletter" },
]

export const hero = {
  eyebrow: "Educación en neurología · ES",
  titleTop: "Cerebros",
  titleBottom: "Esponjosos",
  subcopy:
    "Convertimos la neurología en algo que puedes entender, recordar y aplicar.",
  ctaPrimary: { label: "Conócenos", target: "#nosotros" },
  ctaSecondary: { label: "Ver último episodio", href: "#contenido" },
}

export const manifestoText =
  "Ciencia y vida real. Medicina y narrativa. Dos residentes pensando en voz alta para que la neurología deje de sentirse como un idioma ajeno."

export const manifestoItalicWords = [
  "Ciencia",
  "vida",
  "real.",
  "narrativa.",
]

export const founders: Founder[] = [
  {
    id: "stephanie",
    name: "Stephanie",
    role: "Médica Residente · Co-Fundadora",
    photo: "/assets/stephanie.png",
    orderLabel: "01 — Co-fundadora",
    bio: "Al igual que Oscar, soy residente de neurología. Ambos compartimos una visión clara: la medicina y la ciencia suelen comunicarse de forma elitista y difícil. En este proyecto somos dos pilares de igual importancia. Mi rol es anclar nuestra conversación clínica en la empatía, aportando la perspectiva humana y asegurando que cada diagnóstico tenga sentido en la vida real.",
  },
  {
    id: "oscar",
    name: "Oscar",
    role: "Médico Residente · Co-Fundador",
    photo: "/assets/oscar.png",
    orderLabel: "02 — Co-fundador",
    bio: "Junto a Steph, navego las guardias y los libros sabiendo que la ciencia necesita una nueva voz. Nos frustra la divulgación innecesariamente compleja; por eso, nos dedicamos a desmenuzar y traducir. Cerebros Esponjosos es un proyecto de mutuo esfuerzo donde ninguno es más grande que el otro: somos dos residentes pensando en voz alta, complementándonos en tiempo real.",
  },
]

export const contentLinks: ContentLink[] = [
  {
    id: "youtube",
    icon: Tv,
    title: "Último episodio en YouTube",
    description: "Neurociencia visual y a profundidad.",
    href: "#",
    cta: "Ver episodio",
    featured: true,
  },
  {
    id: "podcast",
    icon: Mic,
    title: "El podcast de C.E.",
    description: "Escúchanos mientras entrenas o trabajas.",
    href: "#",
    cta: "Escuchar",
  },
  {
    id: "instagram",
    icon: Camera,
    title: "Comunidad Instagram",
    description: "Clips diarios e interacción en vivo.",
    href: "#",
    cta: "Ver comunidad",
  },
  {
    id: "blog",
    icon: BookOpen,
    title: "Artículos y Blog",
    description: "Literatura digerida para leer en 5 minutos.",
    href: "#",
    cta: "Leer",
  },
]

export const newsletter = {
  eyebrow: "El Privado",
  titleA: "La gente no solo aprende.",
  titleB: "Se queda por cómo lo contamos.",
  subcopy:
    "Una vez a la semana. Sin ruido. Solo lo que de verdad vale la pena recordar.",
  placeholder: "hola@tucorreo.com",
  cta: "Suscribirse",
  finePrint: "Cero spam. Te puedes salir cuando quieras.",
  success: "Ya eres parte. Nos vemos el martes.",
}

export const footer = {
  tagline: "Hecho con cuidado desde la residencia de neurología.",
  copyright: "© 2026 Steph & Oscar",
  columns: [
    {
      title: "Contenido",
      links: [
        { label: "YouTube", href: "#" },
        { label: "Podcast", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Términos", href: "#" },
        { label: "Privacidad", href: "#" },
      ],
    },
    {
      title: "Contacto",
      links: [{ label: "hola@cerebrosesponjosos.com", href: "mailto:hola@cerebrosesponjosos.com" }],
    },
  ],
}
```

---

## Task 11: Nav component

**Files:**
- Create: `src/components/Nav.tsx`

- [ ] **Step 1: Create file**

```tsx
import { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { navLinks } from "@/content/site"

export function Nav() {
  const { scrollYProgress, scrollY } = useScroll()
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const [open, setOpen] = useState(false)

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#0a0a0b]/70"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-white/10"
        style={{ opacity: borderOpacity }}
        aria-hidden="true"
      />
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <a
          href="#top"
          className="font-serif text-xl text-white tracking-tight"
        >
          Cerebros Esponjosos
        </a>

        <ul className="hidden md:flex items-center gap-10 text-sm text-zinc-400">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-white transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="text-zinc-300 hover:text-white p-2"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent>
              <div className="mt-16 flex flex-col gap-8">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <a
                      href={l.href}
                      className="font-serif text-3xl text-white hover:text-zinc-300 transition-colors"
                    >
                      {l.label}
                    </a>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <motion.div
        className="h-px bg-white origin-left"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
    </motion.header>
  )
}
```

---

## Task 12: Hero section

**Files:**
- Create: `src/sections/Hero.tsx`

- [ ] **Step 1: Create file**

```tsx
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import { hero } from "@/content/site"

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden"
    >
      {/* Radial background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          className="w-[900px] h-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)",
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div
          className="mb-12 relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(20px)",
            }}
          />
          <img
            src="/assets/brain.png"
            alt="Cerebros Esponjosos logo"
            className="relative w-full h-full object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </motion.div>

        {/* Eyebrow */}
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-xs font-medium text-zinc-400 mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {hero.eyebrow}
          </div>
        </FadeIn>

        {/* Title */}
        <FadeIn delay={0.1}>
          <h1
            className="font-serif leading-[0.95] tracking-[-0.03em] mb-8"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            <span className="block text-white">{hero.titleTop}</span>
            <span className="block italic text-zinc-500">
              {hero.titleBottom}
            </span>
          </h1>
        </FadeIn>

        {/* Subcopy */}
        <FadeIn delay={0.2}>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
            {hero.subcopy}
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() =>
                document
                  .querySelector(hero.ctaPrimary.target)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {hero.ctaPrimary.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href={hero.ctaSecondary.href}>
                {hero.ctaSecondary.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </FadeIn>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        aria-hidden="true"
      >
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-transparent via-white/40 to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
```

---

## Task 13: Manifesto section (scroll-linked word reveal)

**Files:**
- Create: `src/sections/Manifesto.tsx`

- [ ] **Step 1: Create file**

```tsx
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"
import { manifestoText, manifestoItalicWords } from "@/content/site"

function Word({
  word,
  range,
  progress,
  italic,
}: {
  word: string
  range: [number, number]
  progress: MotionValue<number>
  italic: boolean
}) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span
      className={`mr-[0.25em] inline-block ${italic ? "italic text-zinc-300" : ""}`}
      style={{ opacity }}
    >
      {word}
    </motion.span>
  )
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.4"],
  })

  const words = manifestoText.split(" ")

  return (
    <section
      id="manifiesto"
      ref={ref}
      className="relative py-40 px-6 z-10"
    >
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 65%)",
        }}
      />
      <p
        className="relative font-serif text-white leading-[1.15] max-w-5xl mx-auto"
        style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
      >
        {words.map((word, i) => {
          const start = i / words.length
          const end = start + 1 / words.length
          const clean = word.replace(/[.,]/g, "")
          const italic = manifestoItalicWords.includes(word) || manifestoItalicWords.includes(clean)
          return (
            <Word
              key={i}
              word={word}
              italic={italic}
              range={[start, end]}
              progress={scrollYProgress}
            />
          )
        })}
      </p>
    </section>
  )
}
```

---

## Task 14: Founders section (asymmetric)

**Files:**
- Create: `src/sections/Founders.tsx`

- [ ] **Step 1: Create file**

```tsx
import { FadeIn } from "@/components/FadeIn"
import { founders } from "@/content/site"

export function Founders() {
  return (
    <section
      id="nosotros"
      className="relative py-32 px-6 border-t border-white/[0.06] z-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn className="mb-20 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Quiénes somos
          </p>
          <h2
            className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            Dos residentes, <span className="italic text-zinc-400">una conversación.</span>
          </h2>
        </FadeIn>

        {/* Founder blocks */}
        <div className="flex flex-col gap-24">
          {founders.map((f, i) => {
            const reverse = i % 2 === 1
            return (
              <FadeIn
                key={f.id}
                delay={0.1}
                className={`grid md:grid-cols-12 gap-10 md:gap-16 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="md:col-span-5">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-[#111113] border border-white/[0.08]">
                    <img
                      src={f.photo}
                      alt={f.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                </div>
                <div className="md:col-span-7">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4">
                    {f.orderLabel}
                  </p>
                  <h3
                    className="font-serif text-white mb-3"
                    style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                  >
                    {f.name}
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-8">
                    {f.role}
                  </p>
                  <p
                    className="text-zinc-400 leading-[1.75] text-base"
                    style={{ maxWidth: "55ch" }}
                  >
                    {f.bio}
                  </p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

---

## Task 15: Content bento section

**Files:**
- Create: `src/sections/Content.tsx`

- [ ] **Step 1: Create file**

```tsx
import { ArrowUpRight, Play } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { contentLinks } from "@/content/site"

export function Content() {
  const featured = contentLinks.find((c) => c.featured)!
  const podcast = contentLinks.find((c) => c.id === "podcast")!
  const instagram = contentLinks.find((c) => c.id === "instagram")!
  const blog = contentLinks.find((c) => c.id === "blog")!

  return (
    <section
      id="contenido"
      className="relative py-32 px-6 border-t border-white/[0.06] z-10"
    >
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Contenido
          </p>
          <h2
            className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            El universo <span className="italic text-zinc-400">Cerebros Esponjosos.</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Featured YouTube */}
          <FadeIn className="md:col-span-8 md:row-span-2">
            <a
              href={featured.href}
              className="group block h-full rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden hover:border-white/[0.2] transition-all"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* TODO: replace with real YouTube thumbnail via API */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-black" aria-hidden="true" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-3">
                    Último episodio
                  </p>
                  <h3
                    className="font-serif text-white leading-tight"
                    style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
                  >
                    {featured.title}
                  </h3>
                </div>
              </div>
            </a>
          </FadeIn>

          {/* Podcast */}
          <FadeIn delay={0.05} className="md:col-span-4">
            <BentoCard link={podcast} />
          </FadeIn>

          {/* Instagram */}
          <FadeIn delay={0.1} className="md:col-span-4">
            <BentoCard link={instagram} />
          </FadeIn>

          {/* Blog wide */}
          <FadeIn delay={0.15} className="md:col-span-12">
            <BentoCardWide link={blog} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function BentoCard({ link }: { link: typeof contentLinks[number] }) {
  const Icon = link.icon
  return (
    <a
      href={link.href}
      className="group flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#111113] p-7 hover:border-white/[0.2] hover:-translate-y-0.5 transition-all"
    >
      <Icon className="h-8 w-8 text-zinc-400 mb-12" aria-hidden="true" />
      <div>
        <h3 className="text-xl font-medium text-white mb-2">{link.title}</h3>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          {link.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm text-zinc-300 group-hover:text-white transition-colors">
          {link.cta}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}

function BentoCardWide({ link }: { link: typeof contentLinks[number] }) {
  const Icon = link.icon
  return (
    <a
      href={link.href}
      className="group flex items-center justify-between gap-6 rounded-2xl border border-white/[0.08] bg-[#111113] p-7 hover:border-white/[0.2] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-1">{link.title}</h3>
          <p className="text-sm text-zinc-500">{link.description}</p>
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" aria-hidden="true" />
    </a>
  )
}
```

---

## Task 16: Newsletter section with react-hook-form + zod

**Files:**
- Create: `src/sections/Newsletter.tsx`

- [ ] **Step 1: Create file**

```tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, Loader2, ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { newsletter } from "@/content/site"

const schema = z.object({
  email: z.string().email("Introduce un email válido."),
})
type FormValues = z.infer<typeof schema>

type Status = "idle" | "loading" | "success" | "error"

export function Newsletter() {
  const [status, setStatus] = useState<Status>("idle")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (_values: FormValues) => {
    setStatus("loading")
    try {
      // TODO: integrate with Beehiiv / Resend / ConvertKit
      await new Promise((r) => setTimeout(r, 800))
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <section
      id="newsletter"
      className="relative py-40 px-6 bg-[#111113] border-y border-white/[0.06] z-10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <div className="inline-block px-4 py-1 border border-white/10 rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400 mb-10">
            · {newsletter.eyebrow} ·
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2
            className="font-serif leading-[1.05] tracking-[-0.02em] mb-10"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            <span className="block text-white">{newsletter.titleA}</span>
            <span className="block italic text-zinc-500">
              {newsletter.titleB}
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-base text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
            {newsletter.subcopy}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          {status === "success" ? (
            <div className="mx-auto max-w-md h-14 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center gap-3 text-emerald-300">
              <Check className="h-5 w-5" aria-hidden="true" />
              <span>{newsletter.success}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mx-auto max-w-md"
              noValidate
            >
              <div
                className={`relative h-14 rounded-full bg-black/40 border ${
                  errors.email || status === "error"
                    ? "border-red-400/60"
                    : "border-white/10 focus-within:border-white/30"
                } transition-colors`}
              >
                <input
                  type="email"
                  placeholder={newsletter.placeholder}
                  aria-label="Email"
                  disabled={status === "loading"}
                  {...register("email")}
                  className="absolute inset-0 h-full w-full bg-transparent pl-6 pr-36 text-sm text-white placeholder:text-zinc-500 focus:outline-none rounded-full"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      {newsletter.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
              {errors.email && (
                <p className="mt-3 text-xs text-red-400">{errors.email.message}</p>
              )}
              {status === "error" && !errors.email && (
                <p className="mt-3 text-xs text-red-400">
                  Algo salió mal. Intenta de nuevo.
                </p>
              )}
              <p className="mt-5 text-xs text-zinc-600">{newsletter.finePrint}</p>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  )
}
```

---

## Task 17: Footer section

**Files:**
- Create: `src/sections/Footer.tsx`

- [ ] **Step 1: Create file**

```tsx
import { footer } from "@/content/site"

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-20 z-10">
      <div className="max-w-6xl mx-auto">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <p className="font-serif text-3xl text-white mb-4">
              Cerebros Esponjosos
            </p>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              {footer.tagline}
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>{footer.copyright}</p>
          <p className="font-mono uppercase tracking-[0.2em]">
            Desde la residencia, con cuidado.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

---

## Task 18: Rewrite `App.tsx` (composition only)

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace entire file**

```tsx
import { LazyMotion, domAnimation } from "framer-motion"
import { Nav } from "@/components/Nav"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Hero } from "@/sections/Hero"
import { Manifesto } from "@/sections/Manifesto"
import { Founders } from "@/sections/Founders"
import { Content } from "@/sections/Content"
import { Newsletter } from "@/sections/Newsletter"
import { Footer } from "@/sections/Footer"

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative min-h-screen bg-[#0a0a0b] text-zinc-100 overflow-x-hidden font-sans">
        <NoiseOverlay />
        <Nav />
        <main className="relative z-10">
          <Hero />
          <Manifesto />
          <Founders />
          <Content />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}
```

---

## Task 19: Update `index.html` (lang, meta, OG)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Read current file**

Run: Read `index.html`

- [ ] **Step 2: Ensure these attributes / tags exist**

- `<html lang="es">`
- `<title>Cerebros Esponjosos — Educación en neurología</title>`
- `<meta name="description" content="Convertimos la neurología en algo que puedes entender, recordar y aplicar. Dos residentes pensando en voz alta." />`
- `<meta property="og:title" content="Cerebros Esponjosos" />`
- `<meta property="og:description" content="Educación en neurología. Lenguaje humano y útil." />`
- `<meta property="og:type" content="website" />`
- `<meta name="viewport" content="width=device-width, initial-scale=1" />` (usually already present)

Edit the file to add any missing tags. Do not remove the existing `<script type="module" src="/src/main.tsx">` or the root div.

---

## Task 20: Final verification

**Files:** none

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors. Warnings from auto-generated shadcn files are acceptable if they exist, but prefer zero.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: completes successfully with no TypeScript or Vite errors. Note the bundle size in the output for reference.

- [ ] **Step 3: Verify no HeroUI references remain**

Run: `grep -rn "@heroui" src/ index.html package.json`
Expected: no output.

- [ ] **Step 4: Verify no references to old `@/utils` path remain**

Run: `grep -rn "from \"@/utils\"" src/`
Expected: no output (all should be `@/lib/utils`).

- [ ] **Step 5: Manual visual check**

Run: `npm run dev`
Open the URL Vite prints. Verify:
- Nav appears sticky, blur visible on scroll, mobile Sheet opens/closes.
- Hero: logo visible with colors (not grayscale, not boxed), title renders in Instrument Serif, CTAs work, scroll hint animates.
- Manifesto: scrolling through the section reveals words progressively.
- Founders: two bios, layout alternates left/right on desktop, photos load.
- Content: bento grid with one large YouTube card + podcast/ig/blog.
- Newsletter: form renders, invalid email shows error, valid email shows loading then success state.
- Footer: three columns + bottom bar.
- Keyboard: Tab through the page — focus ring visible on all interactive elements.
- Reduced motion: toggle "Reduce motion" in OS settings and reload — animations should be near-instant.

- [ ] **Step 6: Stop dev server and report**

Report: bundle size, any runtime warnings in the browser console, and a brief summary of what works / what didn't.

---

## Self-Review Notes

- **Spec coverage:** Nav ✓(T11), Hero ✓(T12), Manifesto ✓(T13), Founders ✓(T14), Content bento ✓(T15), Newsletter ✓(T16), Footer ✓(T17), tokens ✓(T2), shadcn primitives ✓(T6–T9), site content ✓(T10), App composition ✓(T18), a11y/meta ✓(T19), verification ✓(T20). Font loading ✓(T2). LazyMotion ✓(T18). reduced-motion media query ✓(T2).
- **No placeholders:** all code blocks are complete and self-contained. "TODO" comments remain only where the spec explicitly says so (YouTube thumbnail, newsletter backend).
- **Type consistency:** `ContentLink.featured?` boolean used in T10 and read in T15. `Founder` interface fields match their consumption in T14. `cn` imported from `@/lib/utils` everywhere.
