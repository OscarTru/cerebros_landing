# Blog Rediseño + Likes — Spec de Diseño

**Fecha:** 2026-04-12  
**Estado:** Aprobado

---

## Objetivo

Rediseñar la página principal del blog para soportar imágenes en las tarjetas de artículos, y agregar un sistema de likes anónimos por artículo usando Supabase.

---

## 1. Página principal del blog (`/blog`)

### Layout: Editorial con destacado

El artículo más reciente ocupa todo el ancho de la página como elemento destacado. Los artículos restantes se presentan en un grid de 2 columnas.

**Artículo destacado (primero):**
- Imagen de portada a ancho completo (relación 16:9 o 4:3)
- Fecha en monospace uppercase
- Título serif grande (`clamp(2rem, 4vw, 3.5rem)`)
- Descripción breve
- Autor

**Grid de artículos secundarios (resto):**
- Grid de 2 columnas
- Cada tarjeta: imagen thumbnail arriba, fecha + título + descripción abajo
- Sin descripción si el espacio lo requiere en mobile

**Campo `image` en frontmatter:**
- Opcional y backward-compatible — los MDX existentes sin `image` muestran un placeholder (gradiente de color sólido)
- Valor: ruta relativa a `/public/` o URL absoluta
- Ejemplo: `image: "/assets/blog/sueno-cerebro.jpg"`

**Archivos afectados:**
- `src/pages/Blog.tsx` — rediseño completo
- `src/content/blog/*.mdx` — agregar `image` al frontmatter (opcional)
- Tipo `PostMeta` — agregar campo `image?: string`

---

## 2. Sistema de likes por artículo

### Experiencia de usuario

**Estado inicial (sin like):**
- Sección al final del artículo, antes de compartir
- Label: `¿Te gustó este artículo?`
- Botón pill con borde: `♥ (outline) · Me gustó · 24`

**Estado activo (después de dar like):**
- El botón desaparece
- En su lugar: corazón rojo relleno `♥` + contador actualizado (`25`)
- Sin borde, sin texto, sin botón — solo ícono + número
- Transición animada al cambiar estado

**Restricción anti-spam:**
- No se puede deshacer el like
- Se detecta duplicado por fingerprint en el servidor (ver Backend)

### Backend

**Tabla Supabase: `post_likes`**

```sql
create table post_likes (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  fingerprint text not null,
  created_at  timestamptz default now(),
  unique(slug, fingerprint)
);
```

El `fingerprint` se genera en el servidor como hash de `User-Agent + IP` — no se expone al cliente.

**Endpoint: `api/likes.ts`** (Vercel Edge Function)

| Método | Comportamiento |
|--------|---------------|
| `GET /api/likes?slug=xxx` | Devuelve `{ count: number, liked: boolean }`. `liked` se determina generando el fingerprint del request actual y buscando en la tabla. |
| `POST /api/likes` body `{ slug }` | Inserta fila. Si ya existe (unique violation `23505`), devuelve `{ ok: true, already: true }`. Devuelve el count actualizado. |

**Respuesta GET:**
```json
{ "count": 24, "liked": false }
```

**Respuesta POST:**
```json
{ "ok": true, "count": 25, "already": false }
```

### Frontend

**Componente: `LikeButton`** (`src/components/LikeButton.tsx`)

Props: `slug: string`

Comportamiento:
1. Al montar, hace `GET /api/likes?slug=...` para obtener count y estado inicial
2. Si `liked: true`, renderiza directamente el estado activo (♥ rojo + número)
3. Si `liked: false`, renderiza el botón pill completo
4. Al click: llama `POST /api/likes`, actualiza estado a activo con animación

**Archivos afectados:**
- `src/components/LikeButton.tsx` — nuevo componente
- `src/layouts/BlogLayout.tsx` — agregar `<LikeButton slug={slug}>` antes de `<ShareButtons>`
- `api/likes.ts` — nuevo endpoint
- Supabase — nueva tabla `post_likes`

---

## 3. Variables de entorno requeridas

Las existentes (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) son suficientes — no se necesitan nuevas.

---

## 4. Fuera de alcance

- Login o autenticación de usuarios
- Dislike / reacciones múltiples
- Notificaciones al autor cuando alguien da like
- Compartir en redes distintas a las actuales (X, WhatsApp, copiar enlace)
- Paginación del blog

---

## 5. Orden de implementación sugerido

1. Backend: crear tabla `post_likes` en Supabase + endpoint `api/likes.ts`
2. Frontend: componente `LikeButton` + integración en `BlogLayout`
3. Rediseño de `Blog.tsx` con layout editorial
4. Actualizar frontmatter de MDX existentes con campo `image`
