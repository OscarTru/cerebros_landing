# Phase 2 — Dynamic Content (YouTube + Instagram)

**Fecha:** 2026-04-09
**Proyecto:** Cerebros Esponjosos — Landing
**Depende de:** Phase 1 (rediseño completo, ya implementado)

## Objetivo

Reemplazar los placeholders del Bento de contenido con datos reales traídos en build-time desde YouTube (RSS, sin key) e Instagram Graph API (token). Eliminar la card de Podcast del diseño. El contenido se refresca automáticamente vía GitHub Actions cada 6 horas.

## Decisiones clave (alineadas con el usuario)

1. **Fetching en build-time** (no runtime) → cero API calls desde el navegador, cero keys expuestas, compatible con cualquier host estático.
2. **YouTube:** RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id=UC_0iMtxeDkSRB3KjVKsonUA`) — sin API key.
3. **Instagram:** Graph API con Long-Lived Token, vía secrets de GitHub Actions.
4. **Podcast:** eliminado del Bento.
5. **Layout A del Bento:** YouTube grande (8 cols row-span-2) + Instagram feed con 3 posts (4 cols row-span-2) + Blog wide abajo.
6. **Refresh:** GitHub Actions cron `0 */6 * * *` → `npm run fetch:content` → commit del JSON → trigger de redeploy.
7. **Fallback B (resiliente):** si fetch falla, usar el JSON anterior cacheado en `public/data/content.json` y loggear warning. Build no falla.

## Datos conocidos

- **YouTube Channel ID:** `UC_0iMtxeDkSRB3KjVKsonUA`
- **YouTube Channel Name:** "Cerebros Esponjosos"

## Secrets de GitHub Actions (nombres)

- `IG_ACCESS_TOKEN` — Long-lived access token de Instagram Graph API
- `IG_BUSINESS_ACCOUNT_ID` — ID numérico de la cuenta de IG Business
- `META_APP_ID` — App ID de Meta Developer (para refresh opcional)
- `META_APP_SECRET` — App Secret (para refresh opcional)

Token refresh: opcional en Fase 2 — el token dura 60 días. Si el script detecta que faltan <14 días para expirar, loguea warning. Refresh automático se puede añadir después.

## Arquitectura

```
Landing/
├── scripts/
│   └── fetch-content.ts          # Node script, corre en prebuild y en CI
├── public/
│   └── data/
│       └── content.json          # Cache commited al repo, fallback
├── src/
│   ├── content/
│   │   ├── site.ts               # Copy estático (existente, limpiado)
│   │   └── dynamic.ts            # NUEVO: importa content.json con tipos
│   └── sections/
│       └── Content.tsx           # MODIFICADO: nuevo layout A
└── .github/
    └── workflows/
        └── refresh-content.yml   # Cron + commit del JSON actualizado
```

### Flujo

1. **Script de fetch (`scripts/fetch-content.ts`):**
   - Lee `public/data/content.json` existente como fallback.
   - Fetch YouTube RSS → parsea XML (librería `fast-xml-parser`) → extrae el primer `<entry>` no-short (o el primer entry sin filtrar, decisión: **incluir shorts también**, sin filtro, el primer entry es el más reciente).
   - Fetch Instagram Graph API: `GET https://graph.facebook.com/v19.0/{IG_BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=3&access_token={TOKEN}`.
   - Normaliza a un shape tipado.
   - Escribe `public/data/content.json`.
   - Si cualquier fetch falla: loguea warning, preserva lo que había del cache previo para esa fuente, continúa con las otras.
   - Si todo falla y no hay cache previo: escribe JSON vacío con flags y el build sigue (Content.tsx renderiza fallback visual).

2. **`src/content/dynamic.ts`:**
   ```ts
   import contentData from "../../public/data/content.json"
   export interface LatestVideo { id: string; title: string; thumbnail: string; url: string; publishedAt: string }
   export interface IgPost { id: string; caption: string; mediaUrl: string; thumbnailUrl: string | null; permalink: string; mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; timestamp: string }
   export interface DynamicContent { latestVideo: LatestVideo | null; instagramPosts: IgPost[]; fetchedAt: string | null }
   export const dynamicContent = contentData as DynamicContent
   ```

3. **`Content.tsx`:**
   - Importa `dynamicContent`.
   - Si `latestVideo` existe: renderiza card grande con thumbnail real como background, título real del episodio, link a `latestVideo.url`. Si no: placeholder gradiente + copy "Próximamente".
   - Si `instagramPosts.length >= 1`: renderiza Instagram card con grid 2x2 (o lista vertical de 3) de thumbnails, link al permalink del primer post o al perfil. Si no: placeholder con copy.
   - Blog card: queda como link estático (Fase 3).

4. **GitHub Actions workflow:**
   - Trigger: `schedule: cron "0 */6 * * *"` + `workflow_dispatch`.
   - Steps: checkout → setup node 20 → `npm ci` → `npm run fetch:content` con env vars → `git diff --quiet public/data/content.json || (git add public/data/content.json && git commit -m "chore: refresh dynamic content" && git push)`.
   - Secrets inyectados como env: `IG_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`.
   - El push al branch principal disparará el redeploy automático del host (Vercel/Netlify/etc.).

### Layout A del Bento (Content.tsx)

```
Desktop (12 cols):
┌────────────────────────┬──────────────┐
│                        │              │
│   YouTube destacado    │   Instagram  │
│   (8 cols, row-span-2) │   feed       │
│                        │   (4 cols,   │
│                        │   row-span-2)│
│                        │              │
└────────────────────────┴──────────────┘
┌───────────────────────────────────────┐
│   Blog (12 cols, row corta)           │
└───────────────────────────────────────┘

Mobile: stack vertical — YouTube, Instagram, Blog.
```

**YouTube card:** aspect-[16/10], thumbnail `maxresdefault.jpg` (fallback `hqdefault.jpg`), overlay gradiente, eyebrow "Último episodio", título serif, botón play circular flotante.

**Instagram card:**
- Header: icono Camera + "Instagram · @CerebrosEsponjosos" + contador opcional de posts.
- Grid: 3 thumbnails en columna (o 2x1 + 1) con hover scale sutil, cada uno es un `<a>` al permalink del post.
- Footer: "Ver comunidad →" link al perfil público `https://instagram.com/cerebrosesponjosos` (o el handle real — TODO en el script).
- Si un post es video/carousel: badge de icono correspondiente en la esquina.

## Error handling

Cada fuente se fetch-ea en su propio try/catch. Fallas no detienen el build. Solo log + cache previo.

En runtime, Content.tsx tolera `latestVideo === null` y `instagramPosts === []` con fallbacks visuales.

## Dependencies a añadir

- **`fast-xml-parser`** (para el RSS de YouTube).
- **`tsx`** (dev) — para ejecutar el script TypeScript sin compilar.

Nada más. La Graph API se llama con `fetch` nativo de Node 20.

## Scripts de npm

```json
{
  "fetch:content": "tsx scripts/fetch-content.ts",
  "prebuild": "tsx scripts/fetch-content.ts || echo 'fetch failed, using cache'"
}
```

El `|| echo` garantiza que prebuild nunca bloquee el build (fallback B).

## Accesibilidad y perf

- Thumbnails de IG: `loading="lazy"`, `alt` con el caption truncado.
- Thumbnail de YouTube: `loading="eager"` (hero del bento), `alt` con el título del episodio.
- `next/image` no aplica (es Vite) — dejamos `<img>` nativo.
- Tamaños máximos del JSON: negligible (~5 KB).

## Criterios de éxito

- `npm run fetch:content` ejecuta sin tokens → produce `public/data/content.json` con `latestVideo: null, instagramPosts: []` y el build sigue funcionando.
- `npm run fetch:content` ejecuta con tokens válidos → produce JSON con el último video y 3 posts reales.
- `npm run build` usa ese JSON y renderiza la card con thumbnail + título reales.
- GitHub Actions workflow existe, está documentado, y los nombres de los secrets coinciden.
- Card de podcast eliminada del Bento.
- TypeScript sin errores, lint limpio.

## Fuera de alcance (Fase 3 o posterior)

- Refresh automático del IG token cuando se acerca a expirar.
- Blog dinámico.
- Analytics/views del video (requeriría API key de YouTube Data API v3).
- Stats de canal (subs count, total views).
- Caching más granular con revalidación on-demand.
- Testing automatizado del script.
