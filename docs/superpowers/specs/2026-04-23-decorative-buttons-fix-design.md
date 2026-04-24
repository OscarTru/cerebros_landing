# Spec — Fix de botones decorativos en Dashboard

Fecha: 2026-04-23
Rama: `feature/dashboard`

## Objetivo

Convertir los 5 botones decorativos del dashboard en botones funcionales. Sin introducir nueva persistencia robusta ni editores completos — reutilizar modales existentes y añadir los mínimos wires.

## Scope

Afecta a:

- `apps/dashboard/app/(dashboard)/page.tsx` — Overview header (Bell, Semana, Publicar algo)
- `apps/dashboard/app/(dashboard)/newsletter/page.tsx` — Draft card (Continuar editando, Vista previa, Programar)
- `apps/dashboard/components/AgentesClient.tsx` — Context button
- `apps/dashboard/app/(dashboard)/contenido/ContenidoClient.tsx` — leer query params para pre-abrir modal
- `apps/dashboard/app/api/newsletter/send/route.ts` — aceptar `scheduled_at`
- Nueva migración Supabase: tabla `newsletter_scheduled`

No se afectan: Analytics, Colaboraciones, Equipo.

## Decisiones de producto

| Botón | Decisión |
|-------|----------|
| Publicar algo (Overview) | Modal con selector de 4 plataformas (IG, YT, Blog, Newsletter) |
| Bell (Overview) | Popover con la misma data de `AttentionQueue` |
| Semana (Overview) | Eliminado (redundante con el selector del chart) |
| Continuar editando (Newsletter) | Abre modal Redactar existente con subject/body pre-cargados |
| Vista previa (Newsletter) | Mismo modal, pestaña "Preview" |
| Programar (Newsletter) | Mismo modal con input `datetime-local` — persiste en `newsletter_scheduled` |
| Context (Agentes) | Eliminado (el contexto ya se inyecta server-side automáticamente) |

## Arquitectura

### Componentes nuevos

**`components/ui/PublishModal.tsx`** (client)
- Props: `isOpen`, `onClose`.
- Grid 2×2 con 4 cards: Instagram, YouTube, Blog, Newsletter.
- Al click en una card:
  - IG, YT, Blog → `router.push("/contenido?new=1&platform=<X>")`
  - Newsletter → `router.push("/newsletter?draft=1")`
- Cierra al navegar.

**`components/OverviewHeaderActions.tsx`** (client)
- Contiene los botones Bell y Publicar algo.
- Recibe `attentionItems` como prop desde el server component.
- Bell: HeroUI `Popover` que renderiza `<AttentionQueue items={items} />` compacto.
- Publicar algo: abre `<PublishModal />`.

**`app/(dashboard)/newsletter/DraftCard.tsx`** (client)
- Card con el texto del draft hardcoded (por ahora) y los 3 botones.
- Al click en cualquiera de los 3 botones, dispara el modal de `NewsletterHeaderActions` usando un evento custom `window.dispatchEvent(new CustomEvent('newsletter:open-draft', { detail: { mode, subject, body } }))`.
- `mode` ∈ `"edit" | "preview" | "schedule"`.

### Modificaciones a componentes existentes

**`NewsletterHeaderActions.tsx`**
- Escuchar el evento `newsletter:open-draft` en un `useEffect` con listener.
- Cuando se reciba, abrir el modal con el `mode` correspondiente y cargar `subject`/`body` en el form.
- Añadir input `<input type="datetime-local" />` al form, visible solo si `mode === "schedule"` o si el usuario activa un toggle "Programar".
- Añadir tabs Editar/Preview cuando `mode !== "schedule"` (Preview renderiza `body` como `<pre>` o markdown simple vía `marked` si ya está instalado; si no, `<pre>` plano).
- POST a `/api/newsletter/send` incluye `scheduled_at` si existe.

**`ContenidoClient.tsx`**
- Al montar, leer `useSearchParams()` y si `new === "1"` abrir el modal "Nueva pieza" con `platform` pre-seleccionado.
- Después de leer, limpiar la URL con `router.replace("/contenido")` para evitar re-aperturas.

**Overview `page.tsx`**
- Mover los 3 botones del header a `<OverviewHeaderActions attentionItems={data.attentionItems} />`.
- Eliminar botón "Semana".
- Bell usa `data.attentionItems.length` como badge.

**`AgentesClient.tsx`**
- Eliminar líneas 124-128 (botón Context).
- Eliminar `Settings` del import de `lucide-react` si no se usa en otro lado.

### API

**`POST /api/newsletter/send`**
- Body actual: `{ subject: string, body: string }`.
- Body nuevo: `{ subject: string, body: string, scheduled_at?: string (ISO) }`.
- Si `scheduled_at` existe y es una fecha futura:
  - Insertar en `newsletter_scheduled`.
  - Responder `{ scheduled: true, scheduled_at }`.
  - NO llamar a Resend.
- Si no existe `scheduled_at`: comportamiento actual (envío inmediato vía Resend).

### Migración Supabase

`supabase/migrations/<timestamp>_newsletter_scheduled.sql`:

```sql
create table if not exists newsletter_scheduled (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_newsletter_scheduled_pending
  on newsletter_scheduled (scheduled_at)
  where sent_at is null;
```

No hay worker/cron que lo procese aún — se marca como TODO en comentario del handler y en UI (toast: "Programado para el X. El envío automático se habilitará próximamente.").

## Data flow

### Publicar algo → Contenido
1. Usuario click "Publicar algo" en Overview.
2. `PublishModal` se abre.
3. Usuario elige IG.
4. `router.push("/contenido?new=1&platform=instagram")`.
5. `ContenidoClient` detecta query param, abre modal "Nueva pieza" con `platform=instagram`.
6. `router.replace("/contenido")` para limpiar URL.

### Newsletter Programar
1. Usuario click "Programar" en `DraftCard`.
2. `DraftCard` dispara `CustomEvent('newsletter:open-draft', { detail: { mode: 'schedule', subject, body }})`.
3. `NewsletterHeaderActions` escucha, abre modal, pre-carga subject/body, muestra input datetime.
4. Usuario elige fecha y click "Programar envío".
5. POST `/api/newsletter/send` con `scheduled_at`.
6. Server inserta en `newsletter_scheduled`, responde `{ scheduled: true }`.
7. UI muestra toast "Programado para el X".

### Bell popover
1. Usuario click Bell.
2. HeroUI Popover se abre.
3. Renderiza `<AttentionQueue items={items} />` en variante compacta.
4. Click en un item navega al `href` correspondiente y cierra popover.

## Manejo de errores

- **PublishModal**: si `router.push` falla, mostrar toast de error.
- **Newsletter send**: si la API responde error, mostrar `Alert` en modal con el mensaje del server.
- **scheduled_at en el pasado**: validar client-side antes de enviar; server responde 400 si la fecha es pasada.
- **Supabase insert falla**: server responde 500 con mensaje, UI muestra Alert.

## Testing

No hay suite de tests. Verificación manual:

1. Overview: click Bell → popover con items. Click Publicar → modal → click IG → navega a `/contenido` y abre modal nueva pieza con IG pre-seleccionado.
2. Newsletter: click cada uno de los 3 botones del draft card → modal abre en el modo correcto con subject/body cargados. Programar con fecha válida → toast de éxito. Programar con fecha pasada → error.
3. Agentes: botón Context ya no aparece.
4. Contenido: visitar `/contenido?new=1&platform=youtube` directo → modal se abre con YT. URL se limpia.

## Out of scope (siguiente sprint)

- Editor rich text de newsletter.
- Worker que procese `newsletter_scheduled`.
- Persistencia real de borradores (`newsletter_drafts` table).
- Historial de notificaciones persistido.
- Settings page / conexión de plataformas.
