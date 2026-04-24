# Spec — Newsletter Editor con plantilla del frontend

Fecha: 2026-04-24
Rama: `feature/dashboard`

## Objetivo

Convertir el newsletter del dashboard en una plataforma real de composición y envío: editor de bloques + markdown + HTML crudo, preview en vivo que renderiza **exactamente** el mismo template de email que usa el onboarding del frontend (`welcomeHtml` / `firstEditionHtml`), múltiples borradores persistidos, roles Owner/Editor con aprobación obligatoria antes de enviar.

## Decisiones de producto

| Tema | Decisión |
|------|----------|
| Editor | Híbrido: Bloques estructurados + Markdown dentro de bloques + modo HTML crudo |
| Roles | 2: `owner` (aprueba + envía), `editor` (escribe + prueba + solicita aprobación) |
| Borradores | Múltiples, persistidos en tabla `newsletter_drafts` |
| Preview | Iframe con HTML renderizado por el mismo módulo que usa el backend de envío |
| Templates | Extraer a `packages/email-templates/`, usar desde `apps/web` (subscribe) y `apps/dashboard` (editor/send/cron) |
| Test send | Botón "Enviar prueba a mí" usa el email del usuario Clerk actual |
| Aprobación | Flujo `request-approval` → notificación al owner → `approve-send` (ahora o programado) |

## Scope

### Afecta

- `apps/dashboard/app/(dashboard)/newsletter/` — reescritura parcial de `page.tsx` (reemplaza DraftCard único por lista), elimina modal inline, añade `editor/[id]/`
- `apps/dashboard/app/api/newsletter/` — nuevos endpoints `drafts/`, modifica `send/`, `cron/`
- `apps/dashboard/lib/clerk.ts` — añade `requireRole(roles[])`
- `apps/web/app/api/subscribe/route.ts` — reemplaza HTML inline por import de `packages/email-templates`
- Nuevo paquete: `packages/email-templates/`
- Nuevas migraciones: `newsletter_drafts`, ALTER `newsletter_scheduled`

### No afecta

Overview, Analytics, Colaboraciones, Contenido, Agentes, Settings, Equipo.

## Arquitectura

### Nuevo paquete `packages/email-templates/`

Estructura:

```
packages/email-templates/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # exports públicos
    ├── layout.ts             # shell HTML común (doctype, fonts, header, footer)
    ├── styles.ts             # CSS base, paleta, media queries
    ├── components.ts         # primitivos: Hero, Quote, ArticleBlock, NewsItem, Signature, CTAButton
    ├── templates/
    │   ├── welcome.ts        # renderWelcome({ email })
    │   ├── edition.ts        # renderEdition({ email, blocks })
    │   └── custom.ts         # renderCustom({ email, html }) — HTML crudo con footer estándar
    └── types.ts              # EditionBlocks, etc.
```

Exports públicos:

```ts
export function renderWelcome(ctx: { email: string }): string
export function renderEdition(ctx: { email: string; blocks: EditionBlocks }): string
export function renderCustom(ctx: { email: string; html: string }): string
export function renderFromDraft(ctx: { email: string; draft: DraftShape }): string

export interface EditionBlocks {
  heroLabel?: string         // "Tu primera edición" (default "· Esponjosos ·")
  heroTitle: string
  heroSubtitle?: string      // italic secondary line
  article?: {
    label?: string           // "Artículo de fondo"
    title: string
    url: string
    excerpt: string          // párrafos separados por \n\n
    byline?: string          // "Por Oscar Trujillo · 8 min de lectura"
  }
  news?: Array<{
    publication: string      // "Nature, 2026"
    title: string
    url: string
    description: string
  }>
  freeMarkdown?: string      // convertido a HTML para sección de texto libre
  quote?: string
  signature?: string         // default "— Oscar & Stephanie"
}
```

El paquete es **puro** (sin deps de Next/React). Compila a JS ES module. Recibe contexto y devuelve string HTML. Aislado y testeable.

### Editor en dashboard

**Ruta:** `/newsletter/editor/[id]`

**Layout:** 2 columnas desktop (50/50), tabs apilados en mobile.

**Columna izquierda (editor):**

Tabs de modo en la parte superior: `Bloques | Markdown | HTML crudo`.

- **Bloques:** formulario con secciones plegables, cada una un bloque de `EditionBlocks`:
  - Hero (label, title, subtitle)
  - Artículo de fondo (label, title, url, excerpt textarea, byline)
  - Noticias (lista dinámica: añadir/quitar, cada ítem con los 4 campos)
  - Texto libre (markdown con toolbar: **B**, *I*, link, H2, lista)
  - Cita (textarea)
  - Firma (input con default)
- **Markdown:** un único textarea markdown + misma toolbar. Se renderiza dentro de un bloque "texto libre" en el template, sin secciones estructuradas.
- **HTML crudo:** textarea monospace. Warning visible: "Tu HTML se envía tal cual, solo se añade header y footer con unsubscribe".

Cambiar de tab **no borra** los otros modos — cada uno se guarda en su campo (`blocks`/`markdown`/`html`). `mode` marca el activo.

**Columna derecha (preview):**

`<iframe>` (sandbox, srcDoc) que carga el HTML que devuelve `POST /api/newsletter/drafts/:id/preview-render`. Se regenera con debounce 400ms tras cada cambio. Ancho fijo 600px centrado; toggle "Desktop / Mobile".

**Header del editor:**

- Input inline para título del borrador (autosave)
- Input inline para subject del email (requerido para enviar)
- Botones: `Enviar prueba` · `Guardar` (indicador) · `Listo para enviar` (editor) o `Enviar ahora` / `Programar` (owner)

### Lista de borradores en `/newsletter`

Reemplaza `DraftCard` actual. Nuevo componente `DraftList.tsx` (server, carga drafts). Grid de cards, cada una con:

- Título + último autor
- Chip de estado: draft / pending_approval / approved / sent / cancelled
- Fecha modificación
- Click navega a `/newsletter/editor/:id`

Botón "Nuevo envío" arriba de la lista → `POST /api/newsletter/drafts` → redirect al editor.

### Modelo de datos

**Nueva migración:** `supabase/migrations/20260424_newsletter_drafts.sql`

```sql
create type draft_mode as enum ('blocks', 'markdown', 'html');
create type draft_status as enum ('draft', 'pending_approval', 'approved', 'sent', 'cancelled');

create table newsletter_drafts (
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

### API

Todas las rutas bajo `/api/newsletter/drafts/`.

**`GET /api/newsletter/drafts`** — auth: cualquier user del org. Lista todos los borradores con campos `id, title, subject, status, updated_at, created_by, approved_by`.

**`POST /api/newsletter/drafts`** — auth: owner o editor. Crea draft vacío. Body opcional `{ title }`. Devuelve `{ id }`.

**`GET /api/newsletter/drafts/:id`** — auth: cualquier user. Devuelve draft completo.

**`PATCH /api/newsletter/drafts/:id`** — auth: owner o editor. Body parcial: `{ title?, subject?, mode?, blocks?, markdown?, html? }`. Solo se permite si status ∈ {`draft`, `pending_approval`}. Devuelve `{ ok: true, updated_at }`.

**`DELETE /api/newsletter/drafts/:id`** — auth: owner o editor. Solo si status ∈ {`draft`, `cancelled`}. Devuelve `{ ok: true }`.

**`POST /api/newsletter/drafts/:id/preview-render`** — auth: cualquier user. Renderiza el draft usando `packages/email-templates`. Devuelve `{ html }`. Usado por el iframe.

**`POST /api/newsletter/drafts/:id/test-send`** — auth: owner o editor. Envía a `clerkUser.primaryEmailAddress` el HTML renderizado. Subject prefijo "[PRUEBA]". Devuelve `{ ok: true, to }`.

**`POST /api/newsletter/drafts/:id/request-approval`** — auth: owner o editor. Cambia status a `pending_approval`. Valida que `subject` y contenido del modo activo no estén vacíos. Devuelve `{ ok: true }`.

**`POST /api/newsletter/drafts/:id/approve-send`** — auth: **solo owner**. Body `{ mode: "now" | "schedule", scheduled_at?: string }`.
- Si `mode=now`: renderiza HTML, `resend.batch.send()` a confirmados, marca `status='sent'`, `approved_by=userId`.
- Si `mode=schedule`: valida `scheduled_at` futuro, inserta en `newsletter_scheduled` con `draft_id + approved_by`, marca `status='approved'`.
- Devuelve `{ sent: number }` o `{ scheduled_at }`.

**Modificado `POST /api/newsletter/send`** — mantiene comportamiento legacy (subject+body directo sin draft). Añade soporte opcional `draft_id` para envío directo renderizando desde el paquete. No se deprecia en este sprint.

**Modificado `GET /api/newsletter/cron`** — al procesar `newsletter_scheduled`, si hay `draft_id` renderiza con `packages/email-templates`; si no, usa body como antes (backcompat con scheduled pre-draft).

### Permisos

Nueva helper en `apps/dashboard/lib/clerk.ts`:

```ts
export async function requireRole(allowed: Array<"owner" | "editor">): Promise<{ userId: string; role: "owner" | "editor" }> {
  const { userId } = await auth()
  if (!userId) throw new Response("Unauthorized", { status: 401 })
  const role = await getUserRole()  // existing
  const normalized: "owner" | "editor" = role === "owner" ? "owner" : "editor"
  if (!allowed.includes(normalized)) throw new Response("Forbidden", { status: 403 })
  return { userId, role: normalized }
}
```

`getUserRole()` existente devuelve strings como "owner" / "admin" / "basic_member" según Clerk Organization. Lo mapeamos a `editor` por default si no es owner.

Cada endpoint usa `requireRole(["owner"])` o `requireRole(["owner", "editor"])`.

### Notificación al owner

Cuando editor llama `request-approval`:
- Insertamos item en la cola `AttentionQueue` del Overview (ya existe). El Overview ya consulta drafts pendientes — extendemos `getOverviewData()` en `page.tsx` para incluir:
  ```ts
  const { data: pendingApproval } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, created_by, updated_at")
    .eq("status", "pending_approval")
  ```
- Si el usuario es owner, agrega a `attentionItems` un entry "Newsletter 'X' espera aprobación" con href `/newsletter/editor/:id?action=approve`.
- En el editor, si `?action=approve`, arranca en modo readonly con CTAs "Aprobar e enviar ahora" / "Aprobar y programar".

### Refactor de `apps/web/app/api/subscribe/route.ts`

Reemplazar las funciones internas `welcomeHtml(email)` y `firstEditionHtml(email)` por imports:

```ts
import { renderWelcome, renderEdition } from "@cerebros/email-templates"
```

Mantener mismo payload a Resend. Verificar byte-por-byte que el output actual y el nuevo coinciden (primer test al migrar).

## Data flow

### Crear, editar, programar

1. Oscar (owner) o Marta (editor) abre `/newsletter` → ve lista. Click "Nuevo envío".
2. `POST /api/newsletter/drafts` → draft vacío → redirect `/newsletter/editor/<id>`.
3. Escribe en modo Bloques. Cada cambio dispara PATCH con debounce 2s. Indicador "Guardando..." → "Guardado 21:04".
4. Click "Enviar prueba" → `POST /test-send` → recibe email real en su bandeja.
5. Si editor: click "Listo para enviar" → `POST /request-approval` → toast "Enviada para aprobación". Draft bloquea edición adicional.
6. Owner ve notificación en Overview AttentionQueue. Click → abre editor en modo readonly + botones de aprobación.
7. Owner elige "Aprobar y programar", llena fecha, confirma → `POST /approve-send {mode: "schedule", scheduled_at}` → draft status `approved`, fila en `newsletter_scheduled` con `draft_id`.
8. Cron en su ciclo siguiente procesa, renderiza via templates, envía, marca `sent_at` y draft status `sent`.

### Owner envía directo

Mismos pasos 1-4. Luego click "Enviar ahora" → `POST /approve-send {mode: "now"}` → envío inmediato, status `sent`.

### Modo HTML crudo

En editor, user cambia tab a "HTML crudo" → warning. Escribe HTML. Preview muestra ese HTML envuelto solo en layout header+footer (con unsubscribe). Al enviar, `renderCustom` aplica el layout mínimo.

## Manejo de errores

- **Autosave 5xx**: reintentar cada 5s, banner "Sin conexión, reintentando".
- **Test send a email no verificado Clerk**: backend responde 400 con mensaje claro, UI muestra toast con link a Clerk user profile.
- **Approve-send sin suscriptores**: 400 "No hay suscriptores confirmados".
- **Edición de draft en status `sent`**: PATCH devuelve 409 "Este borrador ya fue enviado".
- **Delete en status `sent` o `approved`**: 409.
- **Cron procesa draft borrado**: si `draft_id` no existe pero la fila scheduled tiene body+subject legacy → envía con body directo. Si `draft_id` null y no hay body → marca `error='draft deleted, no fallback'` y no reintenta.
- **Request-approval con campos vacíos**: 400 con detalle de qué falta.
- **Editor intenta approve-send**: 403.

## Testing manual

Sin suite automatizada. Lista de verificación:

1. Subscribe desde frontend recibe welcome email con **mismo** render que antes del refactor (comparar bytes en dev).
2. Crear draft → autosave funciona → recargar página, contenido persiste.
3. Modo bloques: llenar hero + artículo + 3 noticias → preview muestra estructura correcta.
4. Cambiar a markdown → contenido se preserva (bloques no se pierden al volver).
5. Modo HTML: pegar HTML crudo → preview lo muestra + footer con unsubscribe.
6. Test-send: llega email al usuario actual con subject "[PRUEBA] ...".
7. Flujo aprobación: editor pide → owner ve en Overview → aprueba y programa → fila en newsletter_scheduled con draft_id.
8. Cron dispara → envío real → draft status = sent.
9. Editor intenta approve-send → 403.
10. Editor intenta editar draft en status `sent` → 409.

## Out of scope (siguiente iteración)

- Editor WYSIWYG real (TipTap/Lexical).
- Métricas open/click via webhooks Resend.
- A/B testing de subject.
- Segmentación de audiencia.
- Imágenes inline / upload.
- Versionado de borradores.
- Plantillas compartibles entre borradores.
- Drag-and-drop de noticias / bloques.
