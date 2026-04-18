# Analytics Expansion — Design Spec

**Date:** 2026-04-18
**Status:** Pending approval

---

## Goal

Expandir la página de Analytics del dashboard para proveer insights accionables de crecimiento a través de 5 tabs (Overview, Instagram, YouTube, TikTok, Blog) con visualizaciones ricas, período configurable, y arquitectura de data adapters que permite enchufar cada API real cuando estén las credenciales.

**Alcance aprobado:** Nivel C (completa) + Selector de período global (B) + YouTube API Key real + Instagram Graph API real (scope B: intentar todos los insights con fallback mock por campo) + TikTok con mocks inteligentes.

**Lo que NO incluye este spec:**
- Integración OAuth de YouTube (demografía, retención, tráfico por fuente). Esos campos se dejan con mocks marcados con asterisco.
- Integración real de TikTok for Developers API (pending credentials).
- Funcionalidad "Exportar CSV", alertas o emails automáticos (futura feature).

---

## Principios de diseño

- **Reuso del sistema de componentes existente** (`components/ui/*`): StatCard, TrendCard, InfoCard, EmptyState, FadeIn, etc.
- **Chart primitives nuevos** que envuelven Recharts y aceptan datos en formato canónico.
- **Data-source agnostic**: las tabs piden datos a un `analyticsAdapter.getInstagram(period)`, no saben si viene de API real o mock.
- **Progressive disclosure**: cada tab muestra métricas clave arriba, detalles debajo.
- **No bloquear UI cuando una API no está configurada**: si `YOUTUBE_API_KEY` no está, muestra mensaje + datos mock con badge "Demo data".
- **Light/dark mode**: todos los charts leen colores de `--c-*` tokens.

---

## Stack

- **Recharts 2.13** (ya instalado): LineChart, BarChart, PieChart, AreaChart, Heatmap custom con divs
- **HeroUI**: `Dropdown`, `Tabs`, `Button`, `Chip`, `Tooltip`, `Progress`
- **framer-motion**: transiciones entre tabs, stagger de cards
- **YouTube Data API v3** (servidor, usando `fetch` — no requiere SDK)
- **Supabase**: blog likes (ya funcional)

Sin nuevas dependencias npm.

---

## Arquitectura de datos

### Tipos compartidos

```ts
// apps/dashboard/lib/analytics/types.ts

export type Period = "7d" | "30d" | "90d" | "all"

export interface TimeSeriesPoint {
  date: string  // ISO date
  value: number
}

export interface PlatformOverview {
  platform: "instagram" | "youtube" | "tiktok" | "blog" | "newsletter"
  audience: number            // followers / subs / suscriptores
  audienceSeries: TimeSeriesPoint[]
  engagementRate?: number     // 0-100, opcional si no aplica
  totalReach?: number         // impressions/views del período
  growthPercent?: number      // vs período anterior
}

export interface InstagramAnalytics {
  followers: number
  following: number
  postsCount: number
  reach30d: number
  impressions30d: number
  profileVisits30d: number
  websiteClicks30d: number
  followersSeries: TimeSeriesPoint[]
  demographics: {
    age: Array<{ bucket: string; percent: number }>   // "18-24", "25-34", ...
    gender: Array<{ label: string; percent: number }> // "Mujer", "Hombre", "Otro"
  }
  topCities: Array<{ name: string; percent: number }>
  bestPostingHours: Array<{ day: number; hour: number; score: number }> // 0-6 × 0-23
  topPosts: Array<{
    id: string
    thumbnail: string
    caption: string
    likes: number
    comments: number
    reach: number
    permalink: string
  }>
  storiesPerformance: {
    avgViews: number
    completionRate: number
    replies: number
  }
}

export interface YouTubeAnalytics {
  subscribers: number
  totalViews: number
  totalWatchHours: number     // placeholder with mock if no OAuth
  videosCount: number
  avgViewDuration: number     // seconds, placeholder if no OAuth
  viewsSeries: TimeSeriesPoint[]
  subsGainedSeries: TimeSeriesPoint[]
  retentionAvg: number        // 0-100, placeholder if no OAuth
  topVideos: Array<{
    id: string
    thumbnail: string
    title: string
    views: number
    likes: number
    comments: number
    publishedAt: string
    ctr?: number              // placeholder if no OAuth
  }>
  trafficSources: Array<{ source: string; percent: number }> // mock until OAuth
  topCountries: Array<{ code: string; name: string; percent: number }> // mock until OAuth
  isUsingMockData: boolean    // true if some fields come from mocks
}

export interface TikTokAnalytics {
  followers: number
  following: number
  videosCount: number
  totalLikes: number
  totalShares: number
  followersSeries: TimeSeriesPoint[]
  topVideos: Array<{
    id: string
    thumbnail: string
    title: string
    views: number
    likes: number
    shares: number
    comments: number
    completionRate: number
  }>
  topHashtags: Array<{ tag: string; uses: number }>
  bestPostingHours: Array<{ day: number; hour: number; score: number }>
  isUsingMockData: boolean
}

export interface BlogAnalytics {
  totalLikes: number
  totalPosts: number
  likesSeries: TimeSeriesPoint[]
  topPosts: Array<{ slug: string; title: string; likes: number; date: string }>
}

export interface AnalyticsSummary {
  totalAudience: number
  audienceByPlatform: Array<{ platform: string; count: number; percent: number }>
  audienceSeries: Array<{ date: string } & Record<string, number>> // per-platform stacked
  avgEngagementRate: number
  totalReach: number
  topPost: {
    platform: string
    title: string
    metric: string  // "1.2k likes", "15k views"
    thumbnail?: string
  } | null
  platformsComparison: Array<{
    platform: string
    audience: number
    monthlyGrowth: number
    engagementRate: number
    postsPublished: number
    sparkline: TimeSeriesPoint[]
  }>
  lastSync: string  // ISO timestamp
}
```

### Analytics Adapter (facade)

```ts
// apps/dashboard/lib/analytics/adapter.ts

export const analyticsAdapter = {
  async getSummary(period: Period): Promise<AnalyticsSummary> { /* ... */ },
  async getInstagram(period: Period): Promise<InstagramAnalytics> { /* ... */ },
  async getYouTube(period: Period): Promise<YouTubeAnalytics> { /* ... */ },
  async getTikTok(period: Period): Promise<TikTokAnalytics> { /* ... */ },
  async getBlog(period: Period): Promise<BlogAnalytics> { /* ... */ },
  async sync(): Promise<{ syncedAt: string; platforms: string[] }> { /* ... */ },
}
```

### Implementación interna

```
apps/dashboard/lib/analytics/
├── types.ts
├── adapter.ts                 # facade, combina fuentes
├── period.ts                  # helper: periodToDays(period), periodLabel(period), prevPeriod(period)
├── mock/
│   ├── instagram-extras.ts    # demographics fallback si Graph API no devuelve
│   ├── tiktok.ts              # generateTikTokMock(period) — todo mock
│   └── youtube-extras.ts      # retentionAvg, trafficSources, topCountries (sin OAuth)
├── instagram/
│   ├── client.ts              # fetchInstagramData(accessToken, userId, period) — real
│   └── index.ts               # combina real + mock (por-campo fallback)
├── youtube/
│   ├── client.ts              # fetchYouTubeData(apiKey, channelId, period) — real
│   └── index.ts               # combina real + mock
└── blog/
    └── index.ts               # queries reales Supabase
```

### Credenciales YouTube

Variables de entorno:
```
YOUTUBE_API_KEY=<api_key_from_gcp>
YOUTUBE_CHANNEL_ID=<canal_id>
```

Si falta alguna, `youtube/index.ts` devuelve solo mock y marca `isUsingMockData: true`.

### Credenciales Instagram

Variables de entorno:
```
INSTAGRAM_ACCESS_TOKEN=<user_access_token>
INSTAGRAM_APP_ID=<app_id>
INSTAGRAM_APP_SECRET=<app_secret>
INSTAGRAM_USER_ID=<ig_user_id_numeric>
```

`instagram/client.ts` usa Instagram Graph API (`graph.facebook.com/v21.0` o `graph.instagram.com`):
- `/me?fields=followers_count,follows_count,media_count` → stats básicos
- `/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count` → posts
- `/{media-id}/insights?metric=reach,impressions,engagement` → por-post insights (Creator/Business)
- `/me/insights?metric=profile_views,website_clicks,reach,impressions&period=day` → perfil insights
- `/me/insights?metric=audience_gender_age,audience_city,audience_country&period=lifetime` → demografía

**Fallback por campo**: si un endpoint responde 400/403 (permisos o bajo volumen), ese campo cae a mock generado por `instagram-extras.ts`. El panel marca SOLO esos campos con asterisco + tooltip "Datos estimados — revisa permisos de IG Graph API".

### Mocks inteligentes

Los mocks NO son constantes random. Generan data realista:
- Followers crecen ~0.5-2% por semana con ruido
- Engagement entre 3-8% con variación normal
- Top posts ordenados por engagement score
- Heatmap best hours sesgado a noches y fines de semana
- Top ciudades reales mexicanas (CDMX, Guadalajara, Monterrey, etc.)

Todos los mocks son **deterministas** a partir de un seed (cambia solo cada día) para que la UI no esté parpadeando al hacer refresh.

---

## UI: Componentes nuevos

Ubicación: `apps/dashboard/components/ui/charts/`

### 1. `<PeriodSelector>` (client)

```tsx
interface PeriodSelectorProps {
  value: Period
  onChange: (p: Period) => void
}
```
HeroUI Dropdown con 4 opciones: Últimos 7 días / 30 días / 90 días / Todo el tiempo. El período se mantiene en URL search param `?period=30d` para que sea sharable y sobreviva al refresh.

### 2. `<LineChartCard>` (client)

```tsx
interface LineChartCardProps {
  title: string
  description?: string
  data: Array<{ date: string; [key: string]: number | string }>
  lines: Array<{ key: string; label: string; color?: string }>
  height?: number
  loading?: boolean
}
```
Wrapper de Recharts LineChart con gradient fills, tooltip custom con theming, X axis formateado como "12 Abr", Y axis oculto (usa tooltips), grid sutil.

### 3. `<BarChartCard>` (client)

Similar a LineChartCard pero con barras verticales u horizontales (prop `orientation`).

### 4. `<DonutChartCard>` (client)

Pie chart con hole, leyenda lateral, labels de %, colores tomados de prop `data[].color` o fallback a paleta.

### 5. `<HeatmapCard>` (client)

Custom grid 7×24 (días × horas) con celdas coloreadas por intensidad. Tooltip al hover muestra día/hora/score. Labels: lunes-domingo en eje Y, horas en eje X mostrando cada 3h.

### 6. `<SparklineInline>` (client, pequeño)

Mini chart 60×20px sin ejes ni labels, solo la línea. Para usar dentro de tabla comparativa.

### 7. `<PostGridCard>` (client)

Grid de posts/videos. Cada item tiene thumbnail con aspect-ratio 1:1 o 16:9, overlay con stats al hover, click abre permalink externo.

```tsx
interface PostGridCardProps {
  title: string
  posts: Array<{
    id: string
    thumbnail: string
    title?: string
    caption?: string
    stats: Array<{ icon: React.ReactNode; value: string | number }>
    href?: string
  }>
  aspectRatio?: "square" | "video"
}
```

### 8. `<GeoBar>`

Lista horizontal donde cada fila es `[bandera] [nombre] [barra %] [número]`. Para top países/ciudades.

### 9. `<ComparisonTable>` (client)

Tabla específica para Overview. Columnas: Plataforma / Audiencia / Crecimiento mensual / Engagement / Posts / Sparkline. Usa el `<SparklineInline>`.

### 10. `<SyncStatusBadge>` (client)

```tsx
interface SyncStatusBadgeProps {
  lastSync: string
  onSync: () => void
  syncing?: boolean
}
```
Chip con "Sincronizado hace 2h" + ícono refresh. Al clickear llama `onSync()`. Se muestra skeleton mientras `syncing=true`.

### 11. `<MockDataBadge>`

Chip amarillo pequeño que dice "Demo data — integra tu API para ver datos reales". Se muestra cuando `isUsingMockData=true`.

---

## UI: Rediseño de cada tab

### Header de Analytics (común a todas las tabs)

```
[PageHeader: "Analytics" + subtítulo "Métricas de redes sociales y blog"]
  Actions:
    - <SyncStatusBadge lastSync={...} />
    - <PeriodSelector />
```

El `PeriodSelector` actualiza el search param `?period=30d` y cada tab revalida sus queries.

### Tab: **Overview** (cross-platform)

```
┌─────────────────────────────────────────────────────────────┐
│ Hero Row (4 StatCards grandes con trend %)                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│ │Audiencia │ │Engagement│ │ Alcance  │ │  Top post        ││
│ │  total   │ │promedio  │ │acumulado │ │  [thumb]         ││
│ │ +12%     │ │  5.2%    │ │ 45.2K    │ │  1.2K likes      ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Grid 2 columnas                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐│
│ │ LineChartCard           │ │ DonutChartCard              ││
│ │ "Audiencia por          │ │ "Distribución de audiencia" ││
│ │  plataforma"            │ │ IG 45% | YT 25% | ...       ││
│ │ (4 líneas: IG/YT/TT/NL) │ │                             ││
│ └─────────────────────────┘ └─────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ ComparisonTable: todas las plataformas con sparklines       │
└─────────────────────────────────────────────────────────────┘
```

### Tab: **Instagram**

```
[MockDataBadge si no hay API real]

Row 1 — 4 StatCards:
  Seguidores | Posts publicados | Alcance 30d | Impressions 30d

Row 2 — 3 StatCards:
  Profile visits | Website clicks | Avg engagement

Row 3 — LineChartCard "Seguidores últimos 90d" (full width)

Row 4 — 2 columnas:
  ├─ BarChartCard "Demografía por edad" (18-24, 25-34, etc.)
  └─ DonutChartCard "Género"

Row 5 — GeoBar "Top 10 ciudades"

Row 6 — HeatmapCard "Mejores horas para publicar" (7×24)

Row 7 — InfoCard "Performance de Stories"
  3 sub-stats inline: avg views, completion rate, replies

Row 8 — PostGridCard "Top posts" (6 posts en grid 3×2)
```

### Tab: **YouTube**

```
[MockDataBadge si falta API key]

Row 1 — 4 StatCards:
  Subscribers | Vistas totales | Videos | Avg view duration*
  (* marca con asterisco los que son mock por falta de OAuth)

Row 2 — 2 LineChartCards lado a lado:
  ├─ "Vistas últimos 90d"
  └─ "Suscriptores ganados"

Row 3 — StatCard "Retención promedio*" con Progress circular

Row 4 — PostGridCard "Top 5 videos" (aspectRatio="video", 16:9 thumbnails)

Row 5 — 2 columnas:
  ├─ DonutChartCard "Tráfico por fuente*" (YT search / suggested / external / browse)
  └─ GeoBar "Top países*"

(* = mock hasta OAuth phase)
```

### Tab: **TikTok**

```
[MockDataBadge visible siempre — no hay API real aún]

Row 1 — 4 StatCards:
  Followers | Videos | Likes totales | Shares

Row 2 — LineChartCard "Followers últimos 90d"

Row 3 — PostGridCard "Top videos" (aspectRatio="video", 9:16 thumbnails placeholder)
  Stats por video: views, likes, shares, completion rate

Row 4 — 2 columnas:
  ├─ InfoCard "Hashtags populares" (chips horizontal con conteo)
  └─ HeatmapCard "Mejores horas"
```

### Tab: **Blog**

```
Row 1 — 3 StatCards:
  Likes totales | Posts publicados | Avg likes por post

Row 2 — LineChartCard "Likes por semana"

Row 3 — InfoCard "Posts más populares" (ya existe, mantener)
```

---

## Data fetching pattern

Cada tab es un **Server Component** que recibe `searchParams` y hace fetch:

```tsx
// app/(dashboard)/analytics/page.tsx  (server)
import { analyticsAdapter } from "@/lib/analytics/adapter"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period = (["7d", "30d", "90d", "all"].includes(periodParam ?? "")
    ? periodParam
    : "30d") as Period

  const summary = await analyticsAdapter.getSummary(period)

  return (
    <>
      <PageHeader title="Analytics" subtitle="..." actions={<AnalyticsHeaderActions period={period} lastSync={summary.lastSync} />} />
      <AnalyticsTabsClient period={period} summary={summary} />
    </>
  )
}
```

`AnalyticsTabsClient` es el componente que maneja tabs + llama a cada tab's server action o hace fetch a `/api/analytics/[platform]?period=30d`.

**Decisión**: en lugar de server actions, uso **Server Components anidados** para cada tab panel. HeroUI `Tabs` acepta hijos React. Cada tab es un server component que fetchea su data.

Actualmente HeroUI `<Tab>` acepta children estáticos; renderizamos todas las tabs en paralelo en server side, el cliente solo alterna la visibilidad. Trade-off: más data fetching inicial vs más snappy al cambiar de tab. Para este dashboard (low-traffic admin) es preferible.

```tsx
// AnalyticsTabsClient.tsx (client)
"use client"
import { Tabs, Tab } from "@heroui/react"

export function AnalyticsTabsClient({
  overview,
  instagram,
  youtube,
  tiktok,
  blog,
}: Props) {
  return (
    <Tabs ...>
      <Tab key="overview" title="Overview">{overview}</Tab>
      <Tab key="instagram" title="Instagram">{instagram}</Tab>
      <Tab key="youtube" title="YouTube">{youtube}</Tab>
      <Tab key="tiktok" title="TikTok">{tiktok}</Tab>
      <Tab key="blog" title="Blog">{blog}</Tab>
    </Tabs>
  )
}

// page.tsx (server)
const [summary, ig, yt, tt, blog] = await Promise.all([...])
return (
  <AnalyticsTabsClient
    overview={<OverviewPanel data={summary} />}
    instagram={<InstagramPanel data={ig} />}
    ...
  />
)
```

---

## File structure

```
apps/dashboard/
├── lib/analytics/
│   ├── types.ts
│   ├── adapter.ts
│   ├── period.ts
│   ├── mock/
│   │   ├── instagram.ts
│   │   ├── tiktok.ts
│   │   └── youtube-extras.ts
│   ├── youtube/
│   │   ├── client.ts
│   │   └── index.ts
│   └── blog/
│       └── index.ts
├── components/ui/charts/
│   ├── PeriodSelector.tsx
│   ├── LineChartCard.tsx
│   ├── BarChartCard.tsx
│   ├── DonutChartCard.tsx
│   ├── HeatmapCard.tsx
│   ├── SparklineInline.tsx
│   ├── PostGridCard.tsx
│   ├── GeoBar.tsx
│   ├── ComparisonTable.tsx
│   ├── SyncStatusBadge.tsx
│   └── MockDataBadge.tsx
├── components/analytics/
│   ├── AnalyticsHeaderActions.tsx   # SyncStatusBadge + PeriodSelector
│   ├── AnalyticsTabsClient.tsx       # Shell con tabs
│   ├── OverviewPanel.tsx
│   ├── InstagramPanel.tsx
│   ├── YouTubePanel.tsx
│   ├── TikTokPanel.tsx
│   └── BlogPanel.tsx
└── app/(dashboard)/analytics/
    ├── page.tsx                      # server, fetches all data
    └── sync/
        └── route.ts                  # POST /analytics/sync — trigger refresh
```

---

## Período y sincronización

### Cómo funciona el selector

- URL search param: `?period=7d|30d|90d|all` (default `30d`)
- Cambio de período → `router.push('?period=X')` → server revalida
- Los datos se cachean por período con `unstable_cache(key=period)` durante 5 min para evitar rate limits en YT API

### Botón "Sincronizar ahora"

```
POST /api/analytics/sync
```

Fuerza re-fetch de todas las APIs y **revalidateTag("analytics")** para invalidar cache. El UI muestra spinner durante la llamada y luego actualiza `lastSync`.

Para este spec, el endpoint solo:
1. Llama YT API real, descarta cache
2. Regenera mocks IG/TikTok
3. Devuelve `{ syncedAt: new Date().toISOString() }`

El sync **no guarda nada en Supabase** todavía. Cada request a analytics sigue siendo en vivo (con cache 5m). Cuando las APIs reales de IG/TikTok se integren, valdrá la pena agregar tabla `analytics_snapshots` para no pegar tanto las APIs, pero eso va fuera de scope.

---

## Environment variables

Agregar a `.env.local`:

```
# YouTube
YOUTUBE_API_KEY=<API_KEY_FROM_GCP>
YOUTUBE_CHANNEL_ID=<CANAL_ID>

# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=<long_lived_user_token>
INSTAGRAM_APP_ID=<facebook_app_id>
INSTAGRAM_APP_SECRET=<facebook_app_secret>
INSTAGRAM_USER_ID=<ig_user_id_numeric>
```

- Si faltan las YT, el adapter YT devuelve solo mocks y marca `isUsingMockData: true`
- Si faltan las IG, el adapter IG devuelve solo mocks y marca `isUsingMockData: true`
- Si IG está pero algún endpoint específico falla (ej. demographics sin suficientes seguidores), ese campo cae a mock con asterisco

---

## Error handling

- **YT API falla o rate-limited**: fallback a mock + toast silencioso en consola
- **Supabase falla (blog likes)**: devuelve `{ totalLikes: 0, ... }` + mostrar `EmptyState` en esa sección
- **Period inválido en URL**: fallback a `30d`
- **Charts sin datos suficientes** (< 2 puntos): mostrar `EmptyState` con mensaje "Sin datos para este período"

---

## Qué NO cambia

- Existing pages (Overview, Newsletter, Colaboraciones, Contenido, Agentes, Equipo)
- Sidebar, Header, existing UI primitives
- Supabase tables (solo lee, no escribe)
- Clerk auth / middleware
- Existing colaboraciones API

---

## Success criteria

1. Las 5 tabs renderizan sin errores
2. PeriodSelector cambia datos en todas las tabs simultáneamente
3. YouTube muestra datos reales (subs, vistas totales, top videos, viewsSeries) cuando `YOUTUBE_API_KEY` está configurado
4. YouTube muestra mocks + `MockDataBadge` cuando no hay API key
5. Instagram muestra datos reales (followers, posts, likes, comments) cuando `INSTAGRAM_ACCESS_TOKEN` está configurado
6. Instagram cae a mock por-campo si endpoints específicos fallan (demographics, insights de perfil)
7. TikTok siempre muestra mocks + `MockDataBadge`
8. Blog muestra datos reales de Supabase
7. Botón "Sincronizar ahora" funciona y actualiza `lastSync`
8. Light/dark mode correcto en todos los charts
9. `npm run build` pasa con zero errors
10. URL `?period=X` sobrevive refresh y es sharable
