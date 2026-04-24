import { escapeHtml } from "./layout"
import type { ArticleBlock, BlogPromo, EbookCta, NewsItem } from "./types"

// Convierte texto con **bold**, *italic*, y párrafos separados por \n\n.
// Minimal intencional — el template controla el resto.
function renderInline(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
  return s
}

function paragraphs(text: string, cls: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p class="${cls}">${renderInline(p).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

export function coverSection(opts: {
  editionNumber?: string
  badge?: string
  heroTitle: string
  heroSubtitle?: string
  coverIntro?: string
}): string {
  const eyebrow = opts.editionNumber
    ? `<p class="cover-eyebrow">${escapeHtml(opts.editionNumber)}</p>`
    : ""
  const badge = opts.badge
    ? `<div class="cover-badge">· ${escapeHtml(opts.badge)} ·</div>`
    : ""
  const subtitle = opts.heroSubtitle
    ? `<br/><em>${escapeHtml(opts.heroSubtitle)}</em>`
    : ""
  const intro = opts.coverIntro
    ? `<hr class="cover-divider" /><p class="cover-intro">${renderInline(opts.coverIntro)}</p>`
    : ""
  return `<div class="cover">
    ${eyebrow}
    ${badge}
    <h1 class="cover-headline">${escapeHtml(opts.heroTitle)}${subtitle}</h1>
    ${intro}
  </div>`
}

export function articleSection(a: ArticleBlock): string {
  const label = escapeHtml(a.label ?? "Artículo de fondo")
  const byline = a.byline ? `<p class="article-meta">${escapeHtml(a.byline)}</p>` : ""
  const excerpt = paragraphs(a.excerpt, "article-excerpt")
  return `<div class="article-section">
    <p class="section-tag">${label}</p>
    <a href="${escapeHtml(a.url)}" class="article-title" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(a.title)}</a>
    ${excerpt}
    ${byline}
    <a href="${escapeHtml(a.url)}" class="article-cta" style="color:#1a1a1a;text-decoration:none;border-bottom:1px solid #1a1a1a;">Leer artículo completo →</a>
  </div>`
}

export function blogPromoSection(b: BlogPromo): string {
  const cta = escapeHtml(b.cta ?? "Leer en el blog →")
  return `<div class="blog-promo">
    <p class="section-tag">Esta semana en el blog</p>
    <a href="${escapeHtml(b.url)}" class="blog-title" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(b.title)}</a>
    <p class="blog-excerpt">${renderInline(b.excerpt)}</p>
    <a href="${escapeHtml(b.url)}" class="article-cta" style="color:#1a1a1a;text-decoration:none;border-bottom:1px solid #1a1a1a;">${cta}</a>
  </div>`
}

export function newsSection(items: NewsItem[]): string {
  if (items.length === 0) return ""
  const count = `${items.length} ${items.length === 1 ? "noticia" : "noticias"}`
  const rendered = items
    .map(
      (it) => `<div class="news-item">
      <p class="news-source">${escapeHtml(it.publication)}</p>
      <a href="${escapeHtml(it.url)}" class="news-title" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(it.title)}</a>
      <p class="news-text">${renderInline(it.description)}</p>
    </div>`
    )
    .join("")
  return `<div class="news-section">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" class="news-header">
      <tr>
        <td><span class="section-tag">Lo que pasó esta semana</span></td>
        <td style="text-align:right;"><span class="news-count">${count}</span></td>
      </tr>
    </table>
    ${rendered}
  </div>`
}

export function ebookCtaSection(c: EbookCta): string {
  const eyebrow = escapeHtml(c.eyebrow ?? "Descarga gratuita")
  return `<div class="cta-dark">
    <p class="cta-dark-eyebrow">${eyebrow}</p>
    <p class="cta-dark-title">${escapeHtml(c.title)}</p>
    <p class="cta-dark-desc">${renderInline(c.description)}</p>
    <a href="${escapeHtml(c.url)}" class="cta-dark-btn" style="background-color:#ffffff;color:#1a1a1a;text-decoration:none;">${escapeHtml(c.ctaLabel)}</a>
  </div>`
}

export function ideaSection(quote: string): string {
  return `<div class="idea-section">
    <p class="idea-label">Una idea para llevar</p>
    <blockquote class="idea-quote">${escapeHtml(quote)}</blockquote>
  </div>`
}

export function signSection(opts: {
  intro?: string
  name?: string
  role?: string
}): string {
  const intro = opts.intro
    ? `<p class="sign-text">${renderInline(opts.intro).replace(/\n/g, "<br>")}</p>`
    : ""
  const name = escapeHtml(opts.name ?? "Oscar & Stephanie")
  const role = escapeHtml(opts.role ?? "Cerebros Esponjosos")
  return `<div class="sign-section">
    ${intro}
    <p class="sign-name">${name}</p>
    <p class="sign-role">${role}</p>
  </div>`
}

// Legacy exports (usados en welcome.ts y render-from-draft.ts markdown path).
// Se mantienen por compat hacia atrás.
export function hero(title: string, subtitle?: string, label?: string): string {
  return coverSection({
    editionNumber: label,
    heroTitle: title,
    heroSubtitle: subtitle,
  })
}
export function article(a: ArticleBlock): string {
  return articleSection(a)
}
export function newsList(items: NewsItem[]): string {
  return newsSection(items)
}
export function quote(text: string): string {
  return ideaSection(text)
}
export function signature(text?: string): string {
  return signSection({ name: text })
}
