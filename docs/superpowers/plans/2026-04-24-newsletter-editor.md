# Newsletter Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dashboard editor de newsletter con modo bloques + markdown + HTML crudo, preview en vivo idéntico al email de onboarding del frontend, múltiples borradores persistidos, roles owner/editor con flujo de aprobación obligatoria antes de enviar.

**Architecture:** Nuevo paquete compartido `@cerebros/email-templates` que genera HTML puro (edge-compatible) usado por `apps/web` en subscribe y por `apps/dashboard` en editor/send/cron. Tabla `newsletter_drafts` + ALTER en `newsletter_scheduled` enlazando `draft_id`. Nueva ruta `/newsletter/editor/:id` con layout 2-col editor+iframe preview. Helper `requireRole` extendido para aceptar array de roles permitidos.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind v4, HeroUI v2, Clerk (Org metadata role), Supabase, Resend 6, Edge runtime en subscribe, Node runtime en dashboard.

---

## File structure

**Create:**
- `packages/email-templates/package.json`
- `packages/email-templates/tsconfig.json`
- `packages/email-templates/src/index.ts` — exports públicos
- `packages/email-templates/src/types.ts` — `EditionBlocks`, `DraftShape`, `DraftMode`
- `packages/email-templates/src/styles.ts` — paleta + CSS base
- `packages/email-templates/src/layout.ts` — shell (doctype, fonts, header, footer con unsubscribe)
- `packages/email-templates/src/components.ts` — primitivos Hero, Quote, ArticleBlock, NewsItem
- `packages/email-templates/src/markdown.ts` — markdown → HTML simple (bold, italic, link, h2, list)
- `packages/email-templates/src/templates/welcome.ts`
- `packages/email-templates/src/templates/edition.ts`
- `packages/email-templates/src/templates/custom.ts`
- `packages/email-templates/src/render-from-draft.ts`
- `supabase/migrations/20260424_newsletter_drafts.sql`
- `apps/dashboard/app/api/newsletter/drafts/route.ts` — GET list, POST create
- `apps/dashboard/app/api/newsletter/drafts/[id]/route.ts` — GET, PATCH, DELETE
- `apps/dashboard/app/api/newsletter/drafts/[id]/preview-render/route.ts`
- `apps/dashboard/app/api/newsletter/drafts/[id]/test-send/route.ts`
- `apps/dashboard/app/api/newsletter/drafts/[id]/request-approval/route.ts`
- `apps/dashboard/app/api/newsletter/drafts/[id]/approve-send/route.ts`
- `apps/dashboard/app/(dashboard)/newsletter/editor/[id]/page.tsx`
- `apps/dashboard/app/(dashboard)/newsletter/editor/[id]/EditorClient.tsx`
- `apps/dashboard/components/newsletter/BlockEditor.tsx`
- `apps/dashboard/components/newsletter/MarkdownEditor.tsx`
- `apps/dashboard/components/newsletter/HtmlEditor.tsx`
- `apps/dashboard/components/newsletter/EmailPreview.tsx`
- `apps/dashboard/components/newsletter/DraftList.tsx`
- `apps/dashboard/lib/newsletter/types.ts` — re-export tipos del paquete + Draft DB shape

**Modify:**
- `packages/lib/package.json` — add workspace dependency nothing needed (paquete separado)
- `apps/web/package.json` — añadir `"@cerebros/email-templates": "*"`
- `apps/web/app/api/subscribe/route.ts` — reemplazar inline HTML por import
- `apps/dashboard/package.json` — añadir `"@cerebros/email-templates": "*"`
- `apps/dashboard/lib/clerk.ts` — extender `requireRole` para aceptar array
- `apps/dashboard/app/api/newsletter/send/route.ts` — aceptar `draft_id` opcional, renderizar via paquete
- `apps/dashboard/app/api/newsletter/cron/route.ts` — si scheduled tiene `draft_id`, renderizar via paquete
- `apps/dashboard/app/(dashboard)/newsletter/page.tsx` — reemplazar `DraftCard` por `DraftList`, remover `DRAFT_FALLBACK`
- `apps/dashboard/app/(dashboard)/newsletter/NewsletterHeaderActions.tsx` — botón "Redactar envío" navega a `/newsletter/editor/new`, elimina modal interno
- `apps/dashboard/app/(dashboard)/page.tsx` — añadir pendingApproval en attentionItems si owner
- `package.json` (root) — asegurar workspace incluye `packages/*`
- `turbo.json` si existe — no cambios esperados (turbo detecta workspaces)

**Delete after replacement:**
- `apps/dashboard/app/(dashboard)/newsletter/DraftCard.tsx` — reemplazado por `DraftList`

---

## Task 1: Scaffolding del paquete `@cerebros/email-templates`

**Files:**
- Create: `packages/email-templates/package.json`
- Create: `packages/email-templates/tsconfig.json`
- Create: `packages/email-templates/src/index.ts` (stub con export vacío)

- [ ] **Step 1: Crear `packages/email-templates/package.json`**

```json
{
  "name": "@cerebros/email-templates",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {}
}
```

- [ ] **Step 2: Crear `packages/email-templates/tsconfig.json`**

```json
{
  "extends": "@cerebros/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "bundler",
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
```

Si `@cerebros/config/tsconfig.base.json` no existe, verificar con:
```bash
ls packages/config/
```
Y adaptar al nombre real del archivo base.

- [ ] **Step 3: Crear stub `packages/email-templates/src/index.ts`**

```ts
// Exports públicos — se rellenan en tasks siguientes.
export {}
```

- [ ] **Step 4: Registrar paquete en workspace**

Verificar que el root `package.json` incluye `packages/*` en `workspaces`. Correr:
```bash
grep -A3 '"workspaces"' package.json
```

Si no lo incluye, añadirlo. Luego instalar:
```bash
npm install
```

Expected: sin errores, `node_modules/@cerebros/email-templates` existe como symlink.

- [ ] **Step 5: Commit**

```bash
git add packages/email-templates/ package.json package-lock.json
git commit -m "chore(email-templates): scaffold @cerebros/email-templates package

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Tipos compartidos y styles/layout

**Files:**
- Create: `packages/email-templates/src/types.ts`
- Create: `packages/email-templates/src/styles.ts`
- Create: `packages/email-templates/src/layout.ts`

- [ ] **Step 1: Crear `packages/email-templates/src/types.ts`**

```ts
export type DraftMode = "blocks" | "markdown" | "html"

export interface NewsItem {
  publication: string
  title: string
  url: string
  description: string
}

export interface ArticleBlock {
  label?: string
  title: string
  url: string
  excerpt: string
  byline?: string
}

export interface EditionBlocks {
  heroLabel?: string
  heroTitle: string
  heroSubtitle?: string
  article?: ArticleBlock
  news?: NewsItem[]
  freeMarkdown?: string
  quote?: string
  signature?: string
}

export interface DraftShape {
  subject: string
  mode: DraftMode
  blocks: EditionBlocks | null
  markdown: string | null
  html: string | null
}
```

- [ ] **Step 2: Crear `packages/email-templates/src/styles.ts`**

```ts
export const PALETTE = {
  bg: "#fafaf9",
  text: "#18181b",
  textMuted: "#71717a",
  textFaint: "#a1a1aa",
  surface: "#f4f4f5",
  accent: "#18181b",
}

export const BASE_CSS = `
  body { margin: 0; padding: 0; background: ${PALETTE.bg}; color: ${PALETTE.text}; -webkit-font-smoothing: antialiased; }
  table { border-collapse: collapse; }
  img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
  a { color: ${PALETTE.text}; text-decoration: underline; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 24px; }
  .logo { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: ${PALETTE.text}; text-decoration: none; }
  .badge { display: inline-block; border: 1px solid ${PALETTE.textFaint}; padding: 3px 10px; border-radius: 999px; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: ${PALETTE.textMuted}; }
  .hero h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 44px; line-height: 1.1; margin: 16px 0 0; font-weight: 400; }
  .hero .italic { font-style: italic; color: ${PALETTE.textMuted}; }
  .card { background: ${PALETTE.surface}; border-radius: 16px; padding: 28px; margin-top: 24px; }
  .label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${PALETTE.textMuted}; }
  .quote { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; line-height: 1.4; margin: 10px 0 0; font-weight: 400; }
  .p { font-family: 'Inter', -apple-system, sans-serif; font-size: 15px; line-height: 1.7; color: ${PALETTE.text}; font-weight: 300; margin: 14px 0 0; }
  .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid ${PALETTE.surface}; font-family: 'Inter', sans-serif; font-size: 12px; color: ${PALETTE.textFaint}; text-align: center; }
  .footer a { color: ${PALETTE.textMuted}; text-decoration: none; }
  .cta { display: inline-block; background: ${PALETTE.accent}; color: #ffffff !important; padding: 14px 36px; border-radius: 999px; text-decoration: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; }
  .news-item { padding: 18px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
  .news-item:last-child { border-bottom: 0; }
  .news-item .pub { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: ${PALETTE.textMuted}; }
  .news-item h3 { font-family: 'Instrument Serif', Georgia, serif; font-size: 17px; line-height: 1.3; margin: 6px 0 4px; font-weight: 400; }
  .free-md h2 { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; margin: 24px 0 8px; }
  .free-md p { font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.7; font-weight: 300; margin: 10px 0; }
  .free-md ul { padding-left: 20px; }
  .free-md li { margin: 6px 0; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 300; }
  .free-md a { color: ${PALETTE.text}; }
  @media (max-width: 480px) {
    .wrapper { padding: 24px 16px; }
    .hero h1 { font-size: 32px; }
  }
`
```

- [ ] **Step 3: Crear `packages/email-templates/src/layout.ts`**

```ts
import { BASE_CSS } from "./styles"

function unsubscribeUrl(email: string): string {
  const base = "https://cerebrosesponjosos.com/baja"
  return `${base}?e=${encodeURIComponent(email)}`
}

export function layout(opts: {
  title: string
  email: string
  bodyHtml: string
  preheader?: string
}): string {
  const preheader = opts.preheader ?? ""
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<title>${escapeHtml(opts.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>${BASE_CSS}</style>
</head>
<body>
<div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escapeHtml(preheader)}</div>
<div class="wrapper">
  <a class="logo" href="https://cerebrosesponjosos.com">Cerebros Esponjosos</a>
  ${opts.bodyHtml}
  <div class="footer">
    <p>Oscar & Stephanie · Cerebros Esponjosos</p>
    <p><a href="${unsubscribeUrl(opts.email)}">Darme de baja</a> · <a href="https://cerebrosesponjosos.com">cerebrosesponjosos.com</a></p>
  </div>
</div>
</body>
</html>`
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
```

- [ ] **Step 4: Actualizar `packages/email-templates/src/index.ts`**

```ts
export * from "./types"
export { layout, escapeHtml } from "./layout"
```

- [ ] **Step 5: Commit**

```bash
git add packages/email-templates/src/
git commit -m "feat(email-templates): types, styles, and HTML layout shell

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Renderer markdown minimal

**Files:**
- Create: `packages/email-templates/src/markdown.ts`

- [ ] **Step 1: Crear `packages/email-templates/src/markdown.ts`**

```ts
import { escapeHtml } from "./layout"

// Minimal markdown → HTML. Soporta: párrafos, #/## headings, **bold**, *italic*,
// [text](url), listas no anidadas (-), saltos en línea simples.
// No es CommonMark completo — cubre lo que el editor genera con su toolbar.

export function markdownToHtml(md: string): string {
  if (!md.trim()) return ""
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/)
  const out: string[] = []

  for (const rawBlock of blocks) {
    const block = rawBlock.trim()
    if (!block) continue

    // heading
    const h2 = block.match(/^##\s+(.+)$/)
    if (h2) {
      out.push(`<h2>${inline(h2[1])}</h2>`)
      continue
    }
    const h1 = block.match(/^#\s+(.+)$/)
    if (h1) {
      out.push(`<h2>${inline(h1[1])}</h2>`)
      continue
    }

    // list (every line starts with "- ")
    const lines = block.split("\n")
    if (lines.every((l) => /^-\s+/.test(l))) {
      const items = lines.map((l) => `<li>${inline(l.replace(/^-\s+/, ""))}</li>`).join("")
      out.push(`<ul>${items}</ul>`)
      continue
    }

    // paragraph (preserva saltos simples como <br>)
    const paragraph = lines.map((l) => inline(l)).join("<br>")
    out.push(`<p>${paragraph}</p>`)
  }

  return `<div class="free-md">${out.join("")}</div>`
}

function inline(text: string): string {
  let s = escapeHtml(text)
  // links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const safeUrl = /^https?:\/\//.test(url) ? url : "#"
    return `<a href="${safeUrl}">${label}</a>`
  })
  // bold
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  // italic
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
  return s
}
```

- [ ] **Step 2: Exportar en index**

Actualizar `packages/email-templates/src/index.ts`:

```ts
export * from "./types"
export { layout, escapeHtml } from "./layout"
export { markdownToHtml } from "./markdown"
```

- [ ] **Step 3: Commit**

```bash
git add packages/email-templates/src/markdown.ts packages/email-templates/src/index.ts
git commit -m "feat(email-templates): minimal markdown to HTML renderer

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Primitivos `components.ts` (Hero, Article, News, Quote)

**Files:**
- Create: `packages/email-templates/src/components.ts`

- [ ] **Step 1: Crear `packages/email-templates/src/components.ts`**

```ts
import { escapeHtml } from "./layout"
import type { ArticleBlock, NewsItem } from "./types"

export function hero(title: string, subtitle?: string, label?: string): string {
  const lbl = label ? `<span class="badge">${escapeHtml(label)}</span>` : ""
  const sub = subtitle ? `<div class="italic" style="margin-top:4px;">${escapeHtml(subtitle)}</div>` : ""
  return `<div class="hero" style="margin-top:32px;">
    ${lbl}
    <h1>${escapeHtml(title)}</h1>
    ${sub}
  </div>`
}

export function article(a: ArticleBlock): string {
  const label = escapeHtml(a.label ?? "Artículo de fondo")
  const byline = a.byline ? `<p class="p" style="font-size:12px;color:#71717a;">${escapeHtml(a.byline)}</p>` : ""
  const excerptHtml = a.excerpt
    .split(/\n{2,}/)
    .map((para) => `<p class="p">${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("")
  return `<div class="card">
    <p class="label">${label}</p>
    <h2 style="font-family:'Instrument Serif',Georgia,serif; font-size:26px; font-weight:400; margin:10px 0;">
      <a href="${escapeHtml(a.url)}" style="color:#18181b;text-decoration:none;">${escapeHtml(a.title)}</a>
    </h2>
    ${excerptHtml}
    ${byline}
    <p class="p"><a href="${escapeHtml(a.url)}" style="font-size:13px;">Leer artículo completo →</a></p>
  </div>`
}

export function newsList(items: NewsItem[]): string {
  if (items.length === 0) return ""
  const rendered = items.map((it) => `
    <div class="news-item">
      <div class="pub">${escapeHtml(it.publication)}</div>
      <h3><a href="${escapeHtml(it.url)}" style="color:#18181b;text-decoration:none;">${escapeHtml(it.title)}</a></h3>
      <p class="p" style="font-size:13px; margin-top:4px;">${escapeHtml(it.description)}</p>
    </div>
  `).join("")
  return `<div class="card">
    <p class="label">Lo que pasó esta semana · ${items.length} noticias</p>
    ${rendered}
  </div>`
}

export function quote(text: string): string {
  return `<div class="card" style="border-left:3px solid #18181b;">
    <div class="quote italic" style="font-style:italic;">${escapeHtml(text)}</div>
  </div>`
}

export function signature(text?: string): string {
  const t = text ?? "— Oscar & Stephanie"
  return `<p class="p" style="font-family:'Instrument Serif',Georgia,serif; font-style:italic; font-size:16px; margin-top:32px;">${escapeHtml(t)}</p>`
}
```

- [ ] **Step 2: Exportar en index**

```ts
export * from "./types"
export { layout, escapeHtml } from "./layout"
export { markdownToHtml } from "./markdown"
export { hero, article, newsList, quote, signature } from "./components"
```

- [ ] **Step 3: Commit**

```bash
git add packages/email-templates/src/components.ts packages/email-templates/src/index.ts
git commit -m "feat(email-templates): block primitives (hero, article, news, quote)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Templates `welcome`, `edition`, `custom` + `renderFromDraft`

**Files:**
- Create: `packages/email-templates/src/templates/welcome.ts`
- Create: `packages/email-templates/src/templates/edition.ts`
- Create: `packages/email-templates/src/templates/custom.ts`
- Create: `packages/email-templates/src/render-from-draft.ts`

- [ ] **Step 1: Crear `packages/email-templates/src/templates/welcome.ts`**

```ts
import { layout } from "../layout"

export function renderWelcome(ctx: { email: string }): string {
  const body = `
    <span class="badge" style="margin-top:32px; display:inline-block;">· Esponjosos ·</span>
    <div class="hero">
      <h1>Bienvenido.</h1>
      <div class="italic" style="margin-top:4px;">Ya eres parte.</div>
    </div>
    <div class="card">
      <p class="label">Una nota personal</p>
      <p class="quote">Esto no es una newsletter de salud.<br>Es una conversación sobre tu cerebro.</p>
      <p class="p">Cada semana te mandamos una pieza larga — un artículo, un experimento, una idea que nos tiene pensando — y un par de noticias curadas para que tengas contexto real, no clickbait.</p>
      <p class="p">Si algo te rebota, nos contestas este correo. Lo leemos los dos.</p>
    </div>
    <div class="card">
      <p class="label">Qué encontrarás cada semana</p>
      <p class="p"><em style="font-family:'Instrument Serif',serif;font-size:20px;">01.</em> Un artículo de fondo sobre cerebro y comportamiento.</p>
      <p class="p"><em style="font-family:'Instrument Serif',serif;font-size:20px;">02.</em> Tres noticias curadas desde revistas científicas.</p>
      <p class="p"><em style="font-family:'Instrument Serif',serif;font-size:20px;">03.</em> Una idea para llevarte todo el día pensando.</p>
    </div>
    <p class="p" style="font-family:'Instrument Serif',serif;font-style:italic;font-size:16px;margin-top:32px;">— Oscar & Stephanie<br><span style="color:#71717a;">Cerebros Esponjosos</span></p>
    <div style="text-align:center;margin-top:32px;">
      <a href="https://cerebrosesponjosos.com" class="cta">Visitar la web →</a>
    </div>
  `
  return layout({
    title: "Bienvenido a Esponjosos",
    email: ctx.email,
    preheader: "Bienvenido a Cerebros Esponjosos — ya eres parte.",
    bodyHtml: body,
  })
}
```

- [ ] **Step 2: Crear `packages/email-templates/src/templates/edition.ts`**

```ts
import { layout } from "../layout"
import { hero, article, newsList, quote, signature } from "../components"
import { markdownToHtml } from "../markdown"
import type { EditionBlocks } from "../types"

export function renderEdition(ctx: { email: string; blocks: EditionBlocks }): string {
  const b = ctx.blocks
  const parts: string[] = []
  parts.push(hero(b.heroTitle, b.heroSubtitle, b.heroLabel ?? "· Esponjosos ·"))
  if (b.article) parts.push(article(b.article))
  if (b.news && b.news.length > 0) parts.push(newsList(b.news))
  if (b.freeMarkdown && b.freeMarkdown.trim()) {
    parts.push(`<div class="card" style="background:transparent;padding:0;">${markdownToHtml(b.freeMarkdown)}</div>`)
  }
  if (b.quote) parts.push(quote(b.quote))
  parts.push(signature(b.signature))
  return layout({
    title: b.heroTitle,
    email: ctx.email,
    preheader: b.heroSubtitle ?? b.heroTitle,
    bodyHtml: parts.join("\n"),
  })
}
```

- [ ] **Step 3: Crear `packages/email-templates/src/templates/custom.ts`**

```ts
import { layout } from "../layout"

// Envuelve HTML crudo con el layout estándar (solo header + footer con unsubscribe).
// El usuario es responsable de la estructura interna.
export function renderCustom(ctx: { email: string; html: string; subject: string }): string {
  return layout({
    title: ctx.subject,
    email: ctx.email,
    preheader: ctx.subject,
    bodyHtml: ctx.html,
  })
}
```

- [ ] **Step 4: Crear `packages/email-templates/src/render-from-draft.ts`**

```ts
import type { DraftShape } from "./types"
import { renderEdition } from "./templates/edition"
import { renderCustom } from "./templates/custom"
import { markdownToHtml } from "./markdown"
import { layout } from "./layout"

export function renderFromDraft(ctx: { email: string; draft: DraftShape }): string {
  const d = ctx.draft
  switch (d.mode) {
    case "blocks":
      if (!d.blocks) {
        return renderEmpty(ctx.email, d.subject)
      }
      return renderEdition({ email: ctx.email, blocks: d.blocks })
    case "markdown":
      return layout({
        title: d.subject,
        email: ctx.email,
        preheader: d.subject,
        bodyHtml: markdownToHtml(d.markdown ?? ""),
      })
    case "html":
      return renderCustom({ email: ctx.email, html: d.html ?? "", subject: d.subject })
  }
}

function renderEmpty(email: string, subject: string): string {
  return layout({
    title: subject,
    email,
    preheader: "",
    bodyHtml: `<p class="p">Este borrador está vacío.</p>`,
  })
}
```

- [ ] **Step 5: Exportar todo en index**

Sobrescribir `packages/email-templates/src/index.ts`:

```ts
export * from "./types"
export { layout, escapeHtml } from "./layout"
export { markdownToHtml } from "./markdown"
export { hero, article, newsList, quote, signature } from "./components"
export { renderWelcome } from "./templates/welcome"
export { renderEdition } from "./templates/edition"
export { renderCustom } from "./templates/custom"
export { renderFromDraft } from "./render-from-draft"
```

- [ ] **Step 6: Type check**

```bash
cd packages/email-templates && npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add packages/email-templates/src/
git commit -m "feat(email-templates): welcome, edition, custom, renderFromDraft

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Refactor `apps/web/subscribe` para usar paquete

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/app/api/subscribe/route.ts`

- [ ] **Step 1: Añadir dependencia en `apps/web/package.json`**

Editar `apps/web/package.json`, dentro de `dependencies` añadir:
```json
"@cerebros/email-templates": "*",
```

Correr:
```bash
npm install
```

- [ ] **Step 2: Leer el archivo completo para identificar las funciones a reemplazar**

```bash
wc -l apps/web/app/api/subscribe/route.ts
```
Expected: ~533 líneas.

- [ ] **Step 3: Editar `apps/web/app/api/subscribe/route.ts`**

En la parte superior, tras los imports existentes, añadir:
```ts
import { renderWelcome } from "@cerebros/email-templates"
```

Localizar el punto donde se llama a Resend con el welcome email (fetch a `https://api.resend.com/emails`). El body del POST usa `html: welcomeHtml(email)`. Reemplazar por:
```ts
html: renderWelcome({ email })
```

Localizar la definición de la función local `function welcomeHtml(email: string): string { ... }` (aproximadamente línea 133-400) y **eliminarla completa**.

Localizar la segunda llamada a Resend con `html: firstEditionHtml(email)`. Por ahora, reemplazar por:
```ts
html: renderWelcome({ email })
```

Y **eliminar** la función `firstEditionHtml`. Razón: la "primera edición" hardcoded del onboarding desaparece — en el siguiente sprint el sistema podrá enviar una edición real programada desde el dashboard. Mantener el `scheduled_at` y el subject pero con render de welcome por ahora.

**Alternativa segura**: mantener el comportamiento del "first edition" convirtiendo el HTML inline a bloques concretos vía `renderEdition`. Si el HTML inline de `firstEditionHtml` describe un artículo + noticias + quote específicos, convertir a:
```ts
import { renderEdition } from "@cerebros/email-templates"
// ...
html: renderEdition({
  email,
  blocks: {
    heroLabel: "Tu primera edición",
    heroTitle: "Esto es lo que",
    heroSubtitle: "no cabe en 60 segundos.",
    article: {
      label: "Artículo de fondo",
      title: "Tu cerebro no descansa cuando duermes",
      url: "https://cerebrosesponjosos.com/blog/sueno-glinfatico",
      excerpt: "Durante el sueño profundo, el sistema glinfático drena metabolitos acumulados durante el día.\n\nEs limpieza activa, no reposo.",
      byline: "Por Oscar Trujillo · 8 min de lectura",
    },
    news: [
      { publication: "Nature, 2026", title: "Noticia 1", url: "https://cerebrosesponjosos.com", description: "Descripción 1" },
      { publication: "Science, 2026", title: "Noticia 2", url: "https://cerebrosesponjosos.com", description: "Descripción 2" },
      { publication: "Cell, 2026", title: "Noticia 3", url: "https://cerebrosesponjosos.com", description: "Descripción 3" },
    ],
    quote: "El sueño no es el intervalo entre dos días. Es donde ocurre el día siguiente.",
  },
})
```

Escoger la opción alternativa (mantener comportamiento) si el engineer ejecutor considera que perder la "first edition" es un cambio de producto no deseado. Si no, la variante mínima (welcome en ambos emails) es aceptable porque el comportamiento "de verdad" pasará al dashboard.

- [ ] **Step 4: Type check**

```bash
cd apps/web && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 5: Verificar edge runtime no rompe**

El paquete `@cerebros/email-templates` usa solo strings y funciones puras — no accede a `fs`, `process`, ni Node APIs. Edge-compatible. Confirmar que `apps/web/app/api/subscribe/route.ts` sigue teniendo `export const runtime = "edge"` tras los cambios.

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/app/api/subscribe/route.ts package-lock.json
git commit -m "refactor(web): use @cerebros/email-templates for welcome/first-edition

Elimina 400+ líneas de HTML inline. Comportamiento idéntico.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Migración SQL `newsletter_drafts` + ALTER scheduled

**Files:**
- Create: `supabase/migrations/20260424_newsletter_drafts.sql`

- [ ] **Step 1: Crear el archivo**

```sql
-- supabase/migrations/20260424_newsletter_drafts.sql
create type draft_mode as enum ('blocks', 'markdown', 'html');
create type draft_status as enum ('draft', 'pending_approval', 'approved', 'sent', 'cancelled');

create table if not exists newsletter_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Sin título',
  subject text not null default '',
  mode draft_mode not null default 'blocks',
  blocks jsonb,
  markdown text,
  html text,
  status draft_status not null default 'draft',
  created_by text not null,
  approved_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists newsletter_drafts_updated_at on newsletter_drafts;
create trigger newsletter_drafts_updated_at
  before update on newsletter_drafts
  for each row execute function set_updated_at();

alter table newsletter_scheduled
  add column if not exists draft_id uuid references newsletter_drafts(id) on delete set null,
  add column if not exists approved_by text;

create index if not exists idx_newsletter_drafts_status
  on newsletter_drafts (status, updated_at desc);
```

- [ ] **Step 2: Aplicar en Supabase**

Pegar el SQL en Supabase Dashboard → SQL Editor → Run. Verificar que:
- `newsletter_drafts` aparece en Database → Tables.
- `newsletter_scheduled` tiene columnas nuevas `draft_id`, `approved_by`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260424_newsletter_drafts.sql
git commit -m "feat(db): newsletter_drafts + draft_id en newsletter_scheduled

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Extender `requireRole` en `apps/dashboard/lib/clerk.ts`

**Files:**
- Modify: `apps/dashboard/lib/clerk.ts`

- [ ] **Step 1: Reemplazar contenido del archivo**

```ts
import { auth } from "@clerk/nextjs/server"

export type DashboardRole = "owner" | "editor" | "viewer"

export async function getUserRole(): Promise<DashboardRole> {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (role === "owner" || role === "editor" || role === "viewer") return role
  return "viewer"
}

// Overloads: acepta un minRole (legacy, jerárquico) O un array de roles permitidos.
export async function requireRole(minOrAllowed: DashboardRole | DashboardRole[]): Promise<{ userId: string; role: DashboardRole }> {
  const { userId } = await auth()
  if (!userId) throw new Response("Unauthorized", { status: 401 })
  const role = await getUserRole()

  if (Array.isArray(minOrAllowed)) {
    if (!minOrAllowed.includes(role)) {
      throw new Response("Forbidden", { status: 403 })
    }
  } else {
    const hierarchy: DashboardRole[] = ["viewer", "editor", "owner"]
    if (hierarchy.indexOf(role) < hierarchy.indexOf(minOrAllowed)) {
      throw new Response("Forbidden", { status: 403 })
    }
  }

  return { userId, role }
}
```

- [ ] **Step 2: Type check**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/lib/clerk.ts
git commit -m "feat(clerk): requireRole acepta array de roles + retorna userId/role

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: API — listar y crear drafts

**Files:**
- Create: `apps/dashboard/app/api/newsletter/drafts/route.ts`

- [ ] **Step 1: Crear el archivo**

```ts
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, mode, status, created_by, approved_by, updated_at, created_at")
    .order("updated_at", { ascending: false })
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: NextRequest) {
  let ctx: { userId: string; role: "owner" | "editor" | "viewer" }
  try {
    const r = await requireRole(["owner", "editor"])
    ctx = { userId: r.userId, role: r.role }
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Sin título"
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .insert({ title, created_by: ctx.userId, mode: "blocks", blocks: { heroTitle: "" } })
    .select("id")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
```

- [ ] **Step 2: Type check**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/api/newsletter/drafts/route.ts
git commit -m "feat(newsletter): GET/POST /api/newsletter/drafts

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: API — GET/PATCH/DELETE draft individual

**Files:**
- Create: `apps/dashboard/app/api/newsletter/drafts/[id]/route.ts`

- [ ] **Step 1: Crear el archivo**

```ts
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

const EDITABLE_STATUSES = ["draft", "pending_approval"] as const

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })
  return NextResponse.json({ draft: data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const allowed = ["title", "subject", "mode", "blocks", "markdown", "html"] as const
  const payload: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) payload[key] = body[key]
  }

  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from("newsletter_drafts")
    .select("status")
    .eq("id", id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (!EDITABLE_STATUSES.includes(existing.status as typeof EDITABLE_STATUSES[number])) {
    return NextResponse.json({ error: "Este borrador ya no se puede editar" }, { status: 409 })
  }

  const { error, data } = await supabase
    .from("newsletter_drafts")
    .update(payload)
    .eq("id", id)
    .select("updated_at")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, updated_at: data.updated_at })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from("newsletter_drafts")
    .select("status")
    .eq("id", id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (existing.status !== "draft" && existing.status !== "cancelled") {
    return NextResponse.json({ error: "Solo se pueden borrar drafts no enviados" }, { status: 409 })
  }
  const { error } = await supabase.from("newsletter_drafts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/api/newsletter/drafts/\[id\]/route.ts
git commit -m "feat(newsletter): GET/PATCH/DELETE /api/newsletter/drafts/[id]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: API — preview render

**Files:**
- Create: `apps/dashboard/app/api/newsletter/drafts/[id]/preview-render/route.ts`

- [ ] **Step 1: Crear el archivo**

```ts
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("subject, mode, blocks, markdown, html")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const html = renderFromDraft({
    email: "preview@cerebrosesponjosos.com",
    draft: data as DraftShape,
  })
  return NextResponse.json({ html })
}
```

- [ ] **Step 2: Añadir dependencia del paquete**

En `apps/dashboard/package.json`, añadir en `dependencies`:
```json
"@cerebros/email-templates": "*",
```
Correr `npm install`.

- [ ] **Step 3: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/package.json apps/dashboard/app/api/newsletter/drafts/\[id\]/preview-render/ package-lock.json
git commit -m "feat(newsletter): POST preview-render devuelve HTML del draft

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: API — test-send

**Files:**
- Create: `apps/dashboard/app/api/newsletter/drafts/[id]/test-send/route.ts`

- [ ] **Step 1: Crear el archivo**

```ts
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { auth, currentUser } from "@clerk/nextjs/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await currentUser()
  const to = user?.primaryEmailAddress?.emailAddress
  if (!to) return NextResponse.json({ error: "No tienes email verificado en tu cuenta" }, { status: 400 })

  const { id } = await params
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("subject, mode, blocks, markdown, html")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const draft = data as DraftShape
  if (!draft.subject.trim()) {
    return NextResponse.json({ error: "El draft no tiene subject" }, { status: 400 })
  }

  const html = renderFromDraft({ email: to, draft })
  try {
    await resend.emails.send({
      from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
      to,
      subject: `[PRUEBA] ${draft.subject}`,
      html,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: `Resend: ${msg}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true, to })
}
```

- [ ] **Step 2: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/api/newsletter/drafts/\[id\]/test-send/
git commit -m "feat(newsletter): POST test-send envía a primary email del user

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: API — request-approval

**Files:**
- Create: `apps/dashboard/app/api/newsletter/drafts/[id]/request-approval/route.ts`

- [ ] **Step 1: Crear el archivo**

```ts
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const supabase = getSupabase()
  const { data: draft } = await supabase
    .from("newsletter_drafts")
    .select("subject, mode, blocks, markdown, html, status")
    .eq("id", id)
    .maybeSingle()
  if (!draft) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (draft.status !== "draft") {
    return NextResponse.json({ error: `Estado actual '${draft.status}' no permite solicitar aprobación` }, { status: 409 })
  }

  const missing: string[] = []
  if (!draft.subject?.trim()) missing.push("subject")
  if (draft.mode === "blocks" && !(draft.blocks && draft.blocks.heroTitle)) missing.push("hero title (bloques)")
  if (draft.mode === "markdown" && !draft.markdown?.trim()) missing.push("contenido markdown")
  if (draft.mode === "html" && !draft.html?.trim()) missing.push("HTML crudo")
  if (missing.length > 0) {
    return NextResponse.json({ error: `Falta: ${missing.join(", ")}` }, { status: 400 })
  }

  const { error } = await supabase
    .from("newsletter_drafts")
    .update({ status: "pending_approval" })
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/api/newsletter/drafts/\[id\]/request-approval/
git commit -m "feat(newsletter): POST request-approval valida y mueve a pending

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: API — approve-send

**Files:**
- Create: `apps/dashboard/app/api/newsletter/drafts/[id]/approve-send/route.ts`

- [ ] **Step 1: Crear el archivo**

```ts
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  let ctx: { userId: string }
  try {
    const r = await requireRole(["owner"])
    ctx = { userId: r.userId }
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const mode: "now" | "schedule" = body.mode === "schedule" ? "schedule" : "now"
  const scheduledAt: string | undefined = typeof body.scheduled_at === "string" ? body.scheduled_at : undefined

  const supabase = getSupabase()
  const { data: draft } = await supabase
    .from("newsletter_drafts")
    .select("subject, mode, blocks, markdown, html, status")
    .eq("id", id)
    .maybeSingle()
  if (!draft) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (draft.status !== "pending_approval" && draft.status !== "draft") {
    return NextResponse.json({ error: `Estado actual '${draft.status}' no permite aprobar` }, { status: 409 })
  }
  if (!draft.subject?.trim()) {
    return NextResponse.json({ error: "Subject vacío" }, { status: 400 })
  }

  if (mode === "schedule") {
    if (!scheduledAt) return NextResponse.json({ error: "Falta scheduled_at" }, { status: 400 })
    const when = new Date(scheduledAt)
    if (Number.isNaN(when.getTime())) return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    if (when.getTime() <= Date.now()) return NextResponse.json({ error: "La fecha debe ser futura" }, { status: 400 })

    const { error: insErr } = await supabase
      .from("newsletter_scheduled")
      .insert({
        subject: draft.subject,
        body: "",
        scheduled_at: when.toISOString(),
        draft_id: id,
        approved_by: ctx.userId,
      })
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

    const { error: updErr } = await supabase
      .from("newsletter_drafts")
      .update({ status: "approved", approved_by: ctx.userId })
      .eq("id", id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    return NextResponse.json({ scheduled_at: when.toISOString() })
  }

  // Send now
  const { data: subs } = await supabase
    .from("suscriptores")
    .select("email")
    .eq("confirmed", true)
  const emails = (subs ?? []).map((s) => s.email)
  if (emails.length === 0) {
    return NextResponse.json({ error: "No hay suscriptores confirmados" }, { status: 400 })
  }

  const BATCH = 50
  let sent = 0
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)
    await resend.batch.send(
      batch.map((to) => ({
        from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
        to,
        subject: draft.subject,
        html: renderFromDraft({ email: to, draft: draft as DraftShape }),
      }))
    )
    sent += batch.length
  }

  const { error: updErr } = await supabase
    .from("newsletter_drafts")
    .update({ status: "sent", approved_by: ctx.userId })
    .eq("id", id)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  return NextResponse.json({ sent })
}
```

- [ ] **Step 2: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/api/newsletter/drafts/\[id\]/approve-send/
git commit -m "feat(newsletter): POST approve-send (owner only) envía o programa

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Update cron para renderizar desde draft

**Files:**
- Modify: `apps/dashboard/app/api/newsletter/cron/route.ts`

- [ ] **Step 1: Reemplazar archivo completo**

```ts
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = "force-dynamic"
export const maxDuration = 60

type ScheduledRow = {
  id: string
  subject: string
  body: string
  scheduled_at: string
  draft_id: string | null
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const expected = process.env.CRON_SECRET
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabase()
  const now = new Date().toISOString()

  const { data: rows, error: fetchErr } = await supabase
    .from("newsletter_scheduled")
    .select("id, subject, body, scheduled_at, draft_id")
    .is("sent_at", null)
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(10)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const pending = (rows ?? []) as ScheduledRow[]
  if (pending.length === 0) return NextResponse.json({ processed: 0, now })

  const { data: subs } = await supabase
    .from("suscriptores")
    .select("email")
    .eq("confirmed", true)
  const emails = (subs ?? []).map((s) => s.email)
  if (emails.length === 0) {
    return NextResponse.json({ error: "No hay suscriptores confirmados" }, { status: 400 })
  }

  const results: Array<{ id: string; sent?: number; error?: string }> = []

  for (const row of pending) {
    try {
      let draftForRender: DraftShape | null = null
      if (row.draft_id) {
        const { data: draft } = await supabase
          .from("newsletter_drafts")
          .select("subject, mode, blocks, markdown, html")
          .eq("id", row.draft_id)
          .maybeSingle()
        if (draft) draftForRender = draft as DraftShape
      }

      const BATCH = 50
      let sent = 0
      for (let i = 0; i < emails.length; i += BATCH) {
        const batch = emails.slice(i, i + BATCH)
        await resend.batch.send(
          batch.map((to) => ({
            from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
            to,
            subject: row.subject,
            html: draftForRender
              ? renderFromDraft({ email: to, draft: draftForRender })
              : row.body.replace(/\n/g, "<br>"),
          }))
        )
        sent += batch.length
      }

      await supabase
        .from("newsletter_scheduled")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", row.id)

      if (row.draft_id) {
        await supabase
          .from("newsletter_drafts")
          .update({ status: "sent" })
          .eq("id", row.draft_id)
      }

      results.push({ id: row.id, sent })
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown"
      results.push({ id: row.id, error: message })
    }
  }

  return NextResponse.json({ processed: results.length, results, now })
}
```

- [ ] **Step 2: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/api/newsletter/cron/route.ts
git commit -m "feat(newsletter/cron): render desde draft_id si existe, marca draft=sent

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: `DraftList` componente server + reemplazo en page

**Files:**
- Create: `apps/dashboard/components/newsletter/DraftList.tsx`
- Modify: `apps/dashboard/app/(dashboard)/newsletter/page.tsx`
- Delete: `apps/dashboard/app/(dashboard)/newsletter/DraftCard.tsx`

- [ ] **Step 1: Crear `apps/dashboard/components/newsletter/DraftList.tsx`**

```tsx
import Link from "next/link"
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@cerebros/lib"

export interface DraftListItem {
  id: string
  title: string
  subject: string
  status: "draft" | "pending_approval" | "approved" | "sent" | "cancelled"
  updated_at: string
  created_by: string
}

const STATUS_CONFIG: Record<DraftListItem["status"], { label: string; cls: string; icon: typeof FileText }> = {
  draft:             { label: "Borrador",             cls: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",     icon: FileText },
  pending_approval:  { label: "Esperando aprobación",  cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",  icon: AlertCircle },
  approved:          { label: "Programado",           cls: "bg-teal-500/10 text-teal-600 border-teal-500/20",     icon: Clock },
  sent:              { label: "Enviado",              cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  cancelled:         { label: "Cancelado",            cls: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",     icon: FileText },
}

export function DraftList({ items }: { items: DraftListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--c-border)] bg-[var(--c-surface)] px-6 py-12 text-center">
        <p className="text-[14px] text-[var(--c-text-muted)]">No hay borradores todavía. Crea el primero.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const cfg = STATUS_CONFIG[item.status]
        const Icon = cfg.icon
        return (
          <Link
            key={item.id}
            href={`/newsletter/editor/${item.id}`}
            className="group flex flex-col gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-colors hover:border-[var(--c-border-strong)] hover:bg-[var(--c-surface-2)]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-[14px] font-semibold text-[var(--c-text)]">{item.title}</p>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", cfg.cls)}>
                <Icon className="h-3 w-3" />
                {cfg.label}
              </span>
            </div>
            <p className="line-clamp-2 text-[12px] text-[var(--c-text-muted)]">
              {item.subject || "Sin asunto"}
            </p>
            <p className="mt-auto pt-3 border-t border-[var(--c-border)] text-[10.5px] text-[var(--c-text-subtle)]">
              Actualizado {new Date(item.updated_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Modificar `apps/dashboard/app/(dashboard)/newsletter/page.tsx`**

Reemplazar imports y el bloque draft:

```tsx
import { getSupabase } from "@/lib/supabase"
import type { NewsletterSubscriber } from "@cerebros/lib"
import { NewsletterClient } from "./NewsletterClient"
import { NewsletterHeaderActions } from "./NewsletterHeaderActions"
import { DraftList, type DraftListItem } from "@/components/newsletter/DraftList"
import { ScheduledList, type ScheduledItem } from "./ScheduledList"

async function getScheduled(): Promise<ScheduledItem[]> {
  const { data } = await getSupabase()
    .from("newsletter_scheduled")
    .select("id, subject, scheduled_at")
    .is("sent_at", null)
    .order("scheduled_at", { ascending: true })
  return (data ?? []) as ScheduledItem[]
}

async function getDrafts(): Promise<DraftListItem[]> {
  const { data } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, status, updated_at, created_by")
    .order("updated_at", { ascending: false })
    .limit(24)
  return (data ?? []) as DraftListItem[]
}

async function getSubscribers() {
  const { data, count } = await getSupabase()
    .from("suscriptores")
    .select("id, email, nombre, confirmed, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100)

  const confirmed = data?.filter((s) => s.confirmed).length ?? 0
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const newThisWeek = data?.filter((s) => s.created_at >= weekAgo).length ?? 0

  return {
    subscribers: (data ?? []) as NewsletterSubscriber[],
    total: count ?? 0,
    confirmed,
    newThisWeek,
  }
}

function nextThursday(): string {
  const today = new Date()
  const dow = today.getDay()
  const daysUntilThursday = (4 - dow + 7) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysUntilThursday)
  return next.toLocaleDateString("es-MX", { day: "numeric", month: "long" })
}

export default async function NewsletterPage() {
  const [{ subscribers, total, confirmed, newThisWeek }, scheduled, drafts] = await Promise.all([
    getSubscribers(),
    getScheduled(),
    getDrafts(),
  ])
  const confirmRate = total > 0 ? Math.round((confirmed / total) * 100) : 0
  const nextSend = nextThursday()

  return (
    <>
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · NEWSLETTER · ESPONJOSOS ·
          </p>
          <h1 className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {total.toLocaleString("es-MX")} personas te leen{" "}
            <span className="text-[var(--c-text-muted)]">los jueves.</span>
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
            {confirmRate}% confirm rate · próximo envío en {nextSend} · +{newThisWeek} nuevos esta semana
          </p>
        </div>
        <NewsletterHeaderActions />
      </div>

      <div className="flex flex-col gap-6 p-8">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-medium text-[var(--c-text)]">Borradores</p>
          </div>
          <DraftList items={drafts} />
        </div>

        <ScheduledList items={scheduled} />

        <NewsletterClient subscribers={subscribers} total={total} confirmed={confirmed} />
      </div>
    </>
  )
}
```

- [ ] **Step 3: Eliminar `DraftCard.tsx`**

```bash
rm apps/dashboard/app/\(dashboard\)/newsletter/DraftCard.tsx
```

- [ ] **Step 4: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/components/newsletter/DraftList.tsx apps/dashboard/app/\(dashboard\)/newsletter/
git commit -m "feat(newsletter): DraftList con grid de borradores, elimina DraftCard

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 17: `NewsletterHeaderActions` — botón navega a editor

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/newsletter/NewsletterHeaderActions.tsx`

- [ ] **Step 1: Reemplazar archivo**

```tsx
"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Download, PenLine, Loader2 } from "lucide-react"

export function NewsletterHeaderActions() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  function handleExport() {
    window.location.href = "/api/newsletter/export"
  }

  async function handleNew() {
    setCreating(true)
    try {
      const res = await fetch("/api/newsletter/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (res.ok && json.id) router.push(`/newsletter/editor/${json.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Exportar
      </button>
      <button
        onClick={handleNew}
        disabled={creating}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenLine className="h-3.5 w-3.5" />}
        Redactar envío
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/\(dashboard\)/newsletter/NewsletterHeaderActions.tsx
git commit -m "refactor(newsletter): botón Redactar crea draft y navega al editor

Elimina modal inline (obsoleto). El flujo pasa por /editor/[id].

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 18: Editor — componentes de bloques, markdown, html, preview

**Files:**
- Create: `apps/dashboard/components/newsletter/BlockEditor.tsx`
- Create: `apps/dashboard/components/newsletter/MarkdownEditor.tsx`
- Create: `apps/dashboard/components/newsletter/HtmlEditor.tsx`
- Create: `apps/dashboard/components/newsletter/EmailPreview.tsx`

- [ ] **Step 1: Crear `BlockEditor.tsx`**

```tsx
"use client"
import { Plus, Trash2 } from "lucide-react"
import type { EditionBlocks, NewsItem } from "@cerebros/email-templates"

interface Props {
  value: EditionBlocks
  onChange: (next: EditionBlocks) => void
}

const INPUT = "w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2.5 text-[13px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)] transition-colors"
const LABEL = "mb-1 block text-[10.5px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]"

export function BlockEditor({ value, onChange }: Props) {
  const v = value

  function update<K extends keyof EditionBlocks>(key: K, val: EditionBlocks[K]) {
    onChange({ ...v, [key]: val })
  }

  function updateArticle(patch: Partial<NonNullable<EditionBlocks["article"]>>) {
    onChange({ ...v, article: { ...(v.article ?? { title: "", url: "", excerpt: "" }), ...patch } })
  }

  function addNews() {
    const next: NewsItem[] = [...(v.news ?? []), { publication: "", title: "", url: "", description: "" }]
    onChange({ ...v, news: next })
  }
  function updateNews(i: number, patch: Partial<NewsItem>) {
    const next = [...(v.news ?? [])]
    next[i] = { ...next[i], ...patch }
    onChange({ ...v, news: next })
  }
  function removeNews(i: number) {
    const next = [...(v.news ?? [])]
    next.splice(i, 1)
    onChange({ ...v, news: next })
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Hero">
        <div>
          <label className={LABEL}>Etiqueta (opcional)</label>
          <input className={INPUT} value={v.heroLabel ?? ""} onChange={(e) => update("heroLabel", e.target.value)} placeholder="· Esponjosos ·" />
        </div>
        <div>
          <label className={LABEL}>Título</label>
          <input className={INPUT} value={v.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} placeholder="Esto es lo que" />
        </div>
        <div>
          <label className={LABEL}>Subtítulo (italic)</label>
          <input className={INPUT} value={v.heroSubtitle ?? ""} onChange={(e) => update("heroSubtitle", e.target.value)} placeholder="no cabe en 60 segundos." />
        </div>
      </Section>

      <Section title="Artículo de fondo (opcional)">
        <div>
          <label className={LABEL}>Título</label>
          <input className={INPUT} value={v.article?.title ?? ""} onChange={(e) => updateArticle({ title: e.target.value })} />
        </div>
        <div>
          <label className={LABEL}>URL</label>
          <input className={INPUT} value={v.article?.url ?? ""} onChange={(e) => updateArticle({ url: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className={LABEL}>Resumen (párrafos separados por línea vacía)</label>
          <textarea className={`${INPUT} resize-y min-h-[90px]`} value={v.article?.excerpt ?? ""} onChange={(e) => updateArticle({ excerpt: e.target.value })} />
        </div>
        <div>
          <label className={LABEL}>Byline</label>
          <input className={INPUT} value={v.article?.byline ?? ""} onChange={(e) => updateArticle({ byline: e.target.value })} placeholder="Por Oscar · 8 min de lectura" />
        </div>
      </Section>

      <Section title="Noticias">
        <div className="flex flex-col gap-3">
          {(v.news ?? []).map((n, i) => (
            <div key={i} className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10.5px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Noticia #{i + 1}</p>
                <button onClick={() => removeNews(i)} className="text-[var(--c-text-muted)] hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={INPUT} placeholder="Publicación, año" value={n.publication} onChange={(e) => updateNews(i, { publication: e.target.value })} />
                <input className={INPUT} placeholder="URL" value={n.url} onChange={(e) => updateNews(i, { url: e.target.value })} />
              </div>
              <input className={`${INPUT} mt-2`} placeholder="Titular" value={n.title} onChange={(e) => updateNews(i, { title: e.target.value })} />
              <textarea className={`${INPUT} mt-2 resize-y min-h-[60px]`} placeholder="Descripción" value={n.description} onChange={(e) => updateNews(i, { description: e.target.value })} />
            </div>
          ))}
          <button onClick={addNews} className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-[var(--c-border)] px-3 py-1.5 text-[12px] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]">
            <Plus className="h-3.5 w-3.5" /> Añadir noticia
          </button>
        </div>
      </Section>

      <Section title="Texto libre (markdown)">
        <textarea
          className={`${INPUT} resize-y min-h-[120px] font-mono text-[12px]`}
          placeholder={"## Subtítulo\n\nPárrafo con **bold** e *italic*.\n\n- Item uno\n- Item dos"}
          value={v.freeMarkdown ?? ""}
          onChange={(e) => update("freeMarkdown", e.target.value)}
        />
      </Section>

      <Section title="Cita">
        <textarea
          className={`${INPUT} resize-y min-h-[60px]`}
          placeholder="Una idea para llevar..."
          value={v.quote ?? ""}
          onChange={(e) => update("quote", e.target.value)}
        />
      </Section>

      <Section title="Firma">
        <input className={INPUT} value={v.signature ?? ""} onChange={(e) => update("signature", e.target.value)} placeholder="— Oscar & Stephanie" />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--c-text-subtle)]">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Crear `MarkdownEditor.tsx`**

```tsx
"use client"
import { Bold, Italic, Link2, Heading2, List } from "lucide-react"
import { useRef } from "react"

interface Props {
  value: string
  onChange: (v: string) => void
}

export function MarkdownEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function wrap(before: string, after: string) {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const e = el.selectionEnd
    const sel = value.slice(s, e)
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, e + before.length) })
  }

  function insertAtLineStart(prefix: string) {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const before = value.slice(0, s).split("\n")
    before[before.length - 1] = prefix + before[before.length - 1]
    const next = before.join("\n") + value.slice(s)
    onChange(next)
  }

  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      <div className="flex items-center gap-1 border-b border-[var(--c-border)] px-3 py-2">
        <ToolBtn onClick={() => wrap("**", "**")} icon={Bold} label="Bold" />
        <ToolBtn onClick={() => wrap("*", "*")} icon={Italic} label="Italic" />
        <ToolBtn onClick={() => wrap("[", "](https://)")} icon={Link2} label="Link" />
        <ToolBtn onClick={() => insertAtLineStart("## ")} icon={Heading2} label="H2" />
        <ToolBtn onClick={() => insertAtLineStart("- ")} icon={List} label="List" />
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="## Título\n\nEscribe aquí con **markdown**..."
        className="w-full resize-y p-4 text-[13px] font-mono text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none min-h-[420px] bg-transparent"
      />
    </div>
  )
}

function ToolBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button onClick={onClick} title={label} className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]">
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}
```

- [ ] **Step 3: Crear `HtmlEditor.tsx`**

```tsx
"use client"
import { AlertTriangle } from "lucide-react"

interface Props {
  value: string
  onChange: (v: string) => void
}

export function HtmlEditor({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>
          Modo avanzado: tu HTML se envía tal cual, solo se añade header con logo y footer con link de "darme de baja".
          Úsalo si tienes un template propio o pegaste código de otra herramienta.
        </p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<h1>Tu título</h1>&#10;<p>Tu HTML aquí...</p>"
        className="w-full resize-y rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4 text-[12px] font-mono text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none min-h-[420px]"
      />
    </div>
  )
}
```

- [ ] **Step 4: Crear `EmailPreview.tsx`**

```tsx
"use client"
import { useEffect, useRef, useState } from "react"
import { Monitor, Smartphone, Loader2 } from "lucide-react"
import { cn } from "@cerebros/lib"

interface Props {
  draftId: string
  // bump esta prop para forzar re-render (ej. tras save)
  revision: number
}

export function EmailPreview({ draftId, revision }: Props) {
  const [html, setHtml] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/newsletter/drafts/${draftId}/preview-render`, { method: "POST" })
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setHtml(j.html ?? "") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [draftId, revision])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-4 py-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--c-text-subtle)]">Preview</p>
        <div className="flex gap-1">
          <button onClick={() => setDevice("desktop")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", device === "desktop" ? "bg-[var(--c-surface-3)] text-[var(--c-text)]" : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]")} aria-label="Desktop"><Monitor className="h-3.5 w-3.5" /></button>
          <button onClick={() => setDevice("mobile")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", device === "mobile" ? "bg-[var(--c-surface-3)] text-[var(--c-text)]" : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]")} aria-label="Mobile"><Smartphone className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[var(--c-bg)] p-6">
        <div className={cn("mx-auto transition-all", device === "desktop" ? "max-w-[640px]" : "max-w-[380px]")}>
          <div className="relative rounded-xl overflow-hidden border border-[var(--c-border)] bg-white shadow-lg">
            {loading && (
              <div className="absolute top-2 right-2 z-10 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> render
              </div>
            )}
            <iframe
              ref={iframeRef}
              srcDoc={html}
              sandbox="allow-same-origin"
              className="w-full h-[720px] block border-0"
              title="Email preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/components/newsletter/
git commit -m "feat(newsletter/editor): BlockEditor, MarkdownEditor, HtmlEditor, EmailPreview

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 19: Editor page + client

**Files:**
- Create: `apps/dashboard/app/(dashboard)/newsletter/editor/[id]/page.tsx`
- Create: `apps/dashboard/app/(dashboard)/newsletter/editor/[id]/EditorClient.tsx`

- [ ] **Step 1: Crear `page.tsx`**

```tsx
import { notFound } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { getUserRole } from "@/lib/clerk"
import { EditorClient, type DraftRow } from "./EditorClient"

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [role, draft] = await Promise.all([
    getUserRole(),
    loadDraft(id),
  ])
  if (!draft) notFound()
  return <EditorClient initialDraft={draft} role={role} />
}

async function loadDraft(id: string): Promise<DraftRow | null> {
  const { data } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, mode, blocks, markdown, html, status, created_by, approved_by, updated_at")
    .eq("id", id)
    .maybeSingle()
  return (data as DraftRow | null) ?? null
}
```

- [ ] **Step 2: Crear `EditorClient.tsx`**

```tsx
"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Blocks, Code, Send, Clock, CheckCircle2, Loader2, Mail, Calendar } from "lucide-react"
import { cn } from "@cerebros/lib"
import { BlockEditor } from "@/components/newsletter/BlockEditor"
import { MarkdownEditor } from "@/components/newsletter/MarkdownEditor"
import { HtmlEditor } from "@/components/newsletter/HtmlEditor"
import { EmailPreview } from "@/components/newsletter/EmailPreview"
import type { EditionBlocks } from "@cerebros/email-templates"

export interface DraftRow {
  id: string
  title: string
  subject: string
  mode: "blocks" | "markdown" | "html"
  blocks: EditionBlocks | null
  markdown: string | null
  html: string | null
  status: "draft" | "pending_approval" | "approved" | "sent" | "cancelled"
  created_by: string
  approved_by: string | null
  updated_at: string
}

type Saved = "idle" | "saving" | "saved" | "error"

export function EditorClient({ initialDraft, role }: { initialDraft: DraftRow; role: "owner" | "editor" | "viewer" }) {
  const router = useRouter()
  const params = useSearchParams()
  const approveFlow = params.get("action") === "approve"

  const [draft, setDraft] = useState<DraftRow>(initialDraft)
  const [saved, setSaved] = useState<Saved>("idle")
  const [previewRev, setPreviewRev] = useState(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const readonly = draft.status === "sent" || draft.status === "approved" || (draft.status === "pending_approval" && role === "editor" && !approveFlow)
  const canApprove = role === "owner" && (draft.status === "pending_approval" || draft.status === "draft")

  function patch(delta: Partial<DraftRow>) {
    setDraft((prev) => ({ ...prev, ...delta }))
    scheduleSave({ ...draft, ...delta })
  }

  function scheduleSave(next: DraftRow) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaved("saving")
    saveTimer.current = setTimeout(() => { persist(next) }, 900)
  }

  async function persist(next: DraftRow) {
    try {
      const res = await fetch(`/api/newsletter/drafts/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: next.title,
          subject: next.subject,
          mode: next.mode,
          blocks: next.blocks,
          markdown: next.markdown,
          html: next.html,
        }),
      })
      setSaved(res.ok ? "saved" : "error")
      if (res.ok) setPreviewRev((r) => r + 1)
    } catch {
      setSaved("error")
    }
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const [testing, setTesting] = useState(false)
  async function handleTest() {
    setTesting(true)
    try {
      const res = await fetch(`/api/newsletter/drafts/${draft.id}/test-send`, { method: "POST" })
      const json = await res.json()
      alert(res.ok ? `Prueba enviada a ${json.to}` : `Error: ${json.error}`)
    } finally { setTesting(false) }
  }

  const [requesting, setRequesting] = useState(false)
  async function handleRequestApproval() {
    setRequesting(true)
    try {
      const res = await fetch(`/api/newsletter/drafts/${draft.id}/request-approval`, { method: "POST" })
      const json = await res.json()
      if (res.ok) {
        setDraft((d) => ({ ...d, status: "pending_approval" }))
      } else {
        alert(`Error: ${json.error}`)
      }
    } finally { setRequesting(false) }
  }

  const [approving, setApproving] = useState(false)
  const [scheduleAt, setScheduleAt] = useState("")
  async function handleApprove(mode: "now" | "schedule") {
    if (mode === "schedule" && !scheduleAt) return alert("Elige fecha y hora")
    setApproving(true)
    try {
      const body: { mode: "now" | "schedule"; scheduled_at?: string } = { mode }
      if (mode === "schedule") body.scheduled_at = new Date(scheduleAt).toISOString()
      const res = await fetch(`/api/newsletter/drafts/${draft.id}/approve-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok) {
        alert(mode === "now" ? `Enviado a ${json.sent} suscriptores` : `Programado para ${new Date(json.scheduled_at).toLocaleString("es-MX")}`)
        router.push("/newsletter")
      } else {
        alert(`Error: ${json.error}`)
      }
    } finally { setApproving(false) }
  }

  const savedBadge = useMemo(() => {
    if (saved === "saving") return <span className="inline-flex items-center gap-1 text-[11px] text-[var(--c-text-muted)]"><Loader2 className="h-3 w-3 animate-spin" /> Guardando</span>
    if (saved === "saved") return <span className="inline-flex items-center gap-1 text-[11px] text-teal-600"><CheckCircle2 className="h-3 w-3" /> Guardado</span>
    if (saved === "error") return <span className="text-[11px] text-red-500">Error al guardar</span>
    return null
  }, [saved])

  return (
    <div className="flex flex-col h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push("/newsletter")} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]" aria-label="Volver">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Título del borrador"
            disabled={readonly}
            className="min-w-0 flex-1 max-w-md rounded-lg bg-transparent px-2 py-1 text-[15px] font-semibold text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:bg-[var(--c-surface-2)] disabled:opacity-70"
          />
          {savedBadge}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleTest} disabled={testing || readonly} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] disabled:opacity-50">
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
            Enviar prueba
          </button>

          {role === "editor" && draft.status === "draft" && (
            <button onClick={handleRequestApproval} disabled={requesting} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium disabled:opacity-50">
              {requesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Listo para enviar
            </button>
          )}

          {canApprove && (
            <>
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="h-8 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 text-[12px] text-[var(--c-text)] outline-none"
              />
              <button onClick={() => handleApprove("schedule")} disabled={approving || !scheduleAt} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] disabled:opacity-50">
                <Calendar className="h-3.5 w-3.5" /> Programar
              </button>
              <button onClick={() => handleApprove("now")} disabled={approving} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium disabled:opacity-50">
                {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Enviar ahora
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subject + tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--c-border)] px-6 py-3">
        <input
          value={draft.subject}
          onChange={(e) => patch({ subject: e.target.value })}
          placeholder="Asunto del email"
          disabled={readonly}
          className="flex-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-1.5 text-[13px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)]"
        />
        <div className="flex gap-1 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] p-0.5">
          {(["blocks", "markdown", "html"] as const).map((m) => {
            const Icon = m === "blocks" ? Blocks : m === "markdown" ? Send : Code
            const label = m === "blocks" ? "Bloques" : m === "markdown" ? "Markdown" : "HTML"
            const active = draft.mode === m
            return (
              <button key={m} onClick={() => patch({ mode: m })} disabled={readonly} className={cn("inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium transition-colors", active ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]" : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]")}>
                <Icon className="h-3 w-3" /> {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
        <div className="overflow-auto border-r border-[var(--c-border)] p-6">
          {draft.mode === "blocks" && (
            <BlockEditor
              value={draft.blocks ?? { heroTitle: "" }}
              onChange={(v) => patch({ blocks: v })}
            />
          )}
          {draft.mode === "markdown" && (
            <MarkdownEditor value={draft.markdown ?? ""} onChange={(v) => patch({ markdown: v })} />
          )}
          {draft.mode === "html" && (
            <HtmlEditor value={draft.html ?? ""} onChange={(v) => patch({ html: v })} />
          )}
        </div>
        <div className="overflow-hidden">
          <EmailPreview draftId={draft.id} revision={previewRev} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/\(dashboard\)/newsletter/editor/
git commit -m "feat(newsletter): editor page 2-col con autosave, test-send, aprobación

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 20: Overview AttentionQueue muestra drafts pendientes (solo owner)

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/page.tsx`

- [ ] **Step 1: Añadir fetch de drafts pendientes para owners**

En el archivo, localizar la función `getOverviewData()`. Añadir en el `Promise.all` existente (antes de la deconstrucción final) una consulta opcional:

```ts
import { getUserRole } from "@/lib/clerk"
```

Dentro de `getOverviewData()`, tras los Promise.all existentes, añadir:

```ts
const role = await getUserRole()
let pendingDrafts: Array<{ id: string; title: string }> = []
if (role === "owner") {
  const { data } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title")
    .eq("status", "pending_approval")
    .order("updated_at", { ascending: false })
    .limit(3)
  pendingDrafts = data ?? []
}
```

Localizar donde se compone `attentionItems`. **Al principio del array** (antes del `colabs` block), añadir:

```ts
for (const d of pendingDrafts) {
  attentionItems.push({
    id: `draft-${d.id}`,
    title: <span>Newsletter <b>"{d.title}"</b> espera tu aprobación</span>,
    subtitle: "Revisa y envía o programa",
    href: `/newsletter/editor/${d.id}?action=approve`,
    cta: "Revisar →",
    priority: "urgent",
  })
}
```

- [ ] **Step 2: Type check + commit**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
git add apps/dashboard/app/\(dashboard\)/page.tsx
git commit -m "feat(overview): owner ve drafts pending_approval en AttentionQueue

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 21: Verificación E2E

**Files:** ninguno

- [ ] **Step 1: Type check global + build**

```bash
cd apps/dashboard && npx tsc --noEmit -p . && npm run build
```
Expected: 0 errores, build completa.

- [ ] **Step 2: Dev server en local**

```bash
cd apps/dashboard && npm run dev
```
Abrir sesión Clerk en `http://localhost:3002`.

- [ ] **Step 3: Checklist en navegador**

Como **owner** (que tú eres hoy):
1. `/newsletter` — ver lista de borradores (al inicio vacía).
2. Click "Redactar envío" → navega a `/newsletter/editor/:id`, draft recién creado.
3. Modo **Bloques**: llenar hero + subject + artículo con URL real. Preview iframe se actualiza (~1s tras debounce).
4. Click "Enviar prueba" → llega email a tu Clerk primary email con `[PRUEBA]` en subject y preview idéntico.
5. Cambiar a modo **Markdown**, escribir `## Título\n\nPárrafo **bold**.`, verificar preview.
6. Cambiar a modo **HTML**, pegar `<h1>Hola</h1><p>Crudo</p>`, verificar que aparece con header+footer del layout.
7. Volver a modo Bloques — **los datos de bloques siguen**.
8. Click "Enviar ahora" → envío inmediato a confirmados. Estado draft → `sent`.
9. Volver a `/newsletter` — draft aparece con chip "Enviado".

Como **editor** (si tienes otra cuenta con `role: editor` en metadata Clerk, o simular cambiando temporalmente el metadata):
10. Crear draft, escribir, click "Listo para enviar" → status → `pending_approval`.
11. Editor no ve botones de envío directo.

Como owner:
12. En `/` (Overview), AttentionQueue muestra "Newsletter 'X' espera tu aprobación".
13. Click → editor con ?action=approve, modo readonly + botones Programar/Enviar.
14. Programar fecha futura → fila en `newsletter_scheduled` con `draft_id`. Draft → `approved`.
15. (Opcional) llamar al cron manualmente con el secret:
```bash
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3002/api/newsletter/cron
```
Si hay fila scheduled vencida, se procesa y el draft pasa a `sent`.

- [ ] **Step 4: Regression — onboarding email**

Ir al frontend, suscribirse con un email de prueba. Verificar que el email de bienvenida llega con el diseño idéntico al que había antes (el refactor usa el paquete compartido).

- [ ] **Step 5: Documentar en commit final si surgieron fixes**

Si la verificación arrojó issues que se corrigieron, commit con mensaje descriptivo. Si no, saltar.

---

## Self-review checklist

1. **Spec coverage:**
   - Editor híbrido bloques+markdown+HTML → Tasks 18, 19
   - Preview con iframe → Task 18 (EmailPreview), Task 11 (endpoint)
   - Templates compartidos con apps/web → Tasks 1-5, 6
   - Múltiples borradores DB → Tasks 7, 9, 10
   - Roles owner/editor con `requireRole` por array → Task 8, usados en 9-14
   - Flujo aprobación (editor request, owner approve) → Tasks 13, 14, 20
   - Link `newsletter_scheduled.draft_id` → Task 7, usado en 14, 15
   - Cron renderiza desde draft → Task 15
   - DraftList en /newsletter → Task 16
   - NewsletterHeaderActions simplificado → Task 17
   - Modo HTML con warning → Task 18 (HtmlEditor)
   - Markdown toolbar → Task 18 (MarkdownEditor)

2. **Placeholder scan:** sin TBD/implement later/similar a task X. Cada task tiene código exacto.

3. **Type consistency:**
   - `EditionBlocks`, `NewsItem`, `DraftShape`, `DraftMode` definidos en Task 2, usados consistentemente en Tasks 4, 5, 10-15, 18, 19
   - `requireRole(allowed[])` signature en Task 8 concuerda con uso en Tasks 9-14
   - `DraftRow` en Task 19 concuerda con SELECT en Task 10 GET y page loadDraft
   - Status strings consistentes: "draft" / "pending_approval" / "approved" / "sent" / "cancelled" en enum SQL (Task 7), API validations (Tasks 10, 13, 14), UI (Task 16, 19)
   - `draft_id` columna en `newsletter_scheduled` (Task 7) usada en Task 14 insert y Task 15 select
