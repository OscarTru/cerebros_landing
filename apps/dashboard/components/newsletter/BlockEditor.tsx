"use client"
import { Plus, Trash2 } from "lucide-react"
import type { BlogPromo, EbookCta, EditionBlocks, NewsItem } from "@cerebros/email-templates"

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

  function updateBlog(patch: Partial<BlogPromo>) {
    onChange({ ...v, blogPromo: { ...(v.blogPromo ?? { title: "", url: "", excerpt: "" }), ...patch } })
  }

  function updateEbook(patch: Partial<EbookCta>) {
    onChange({
      ...v,
      ebookCta: { ...(v.ebookCta ?? { title: "", description: "", ctaLabel: "Descargar gratis →", url: "" }), ...patch },
    })
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
      <Section title="Portada">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>N.º edición</label>
            <input className={INPUT} value={v.editionNumber ?? ""} onChange={(e) => update("editionNumber", e.target.value)} placeholder="Edición N.º 2" />
          </div>
          <div>
            <label className={LABEL}>Badge</label>
            <input className={INPUT} value={v.badge ?? ""} onChange={(e) => update("badge", e.target.value)} placeholder="Esponjosos" />
          </div>
        </div>
        <div>
          <label className={LABEL}>Fecha (opcional)</label>
          <input className={INPUT} value={v.issueDate ?? ""} onChange={(e) => update("issueDate", e.target.value)} placeholder="Deja vacío para fecha de hoy" />
        </div>
        <div>
          <label className={LABEL}>Título principal</label>
          <input className={INPUT} value={v.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} placeholder="El Alzheimer no empieza" />
        </div>
        <div>
          <label className={LABEL}>Subtítulo (italic, va en segunda línea)</label>
          <input className={INPUT} value={v.heroSubtitle ?? ""} onChange={(e) => update("heroSubtitle", e.target.value)} placeholder="cuando aparecen los síntomas" />
        </div>
        <div>
          <label className={LABEL}>Intro de portada</label>
          <textarea className={`${INPUT} resize-y min-h-[80px]`} value={v.coverIntro ?? ""} onChange={(e) => update("coverIntro", e.target.value)} placeholder="Breve resumen de lo que viene en esta edición." />
        </div>
      </Section>

      <Section title="Artículo de fondo (opcional)">
        <div>
          <label className={LABEL}>Etiqueta</label>
          <input className={INPUT} value={v.article?.label ?? ""} onChange={(e) => updateArticle({ label: e.target.value })} placeholder="Artículo de fondo" />
        </div>
        <div>
          <label className={LABEL}>Título</label>
          <input className={INPUT} value={v.article?.title ?? ""} onChange={(e) => updateArticle({ title: e.target.value })} />
        </div>
        <div>
          <label className={LABEL}>URL</label>
          <input className={INPUT} value={v.article?.url ?? ""} onChange={(e) => updateArticle({ url: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className={LABEL}>Resumen (párrafos separados por línea vacía; usa **negrita** y *italic*)</label>
          <textarea className={`${INPUT} resize-y min-h-[120px]`} value={v.article?.excerpt ?? ""} onChange={(e) => updateArticle({ excerpt: e.target.value })} />
        </div>
        <div>
          <label className={LABEL}>Byline</label>
          <input className={INPUT} value={v.article?.byline ?? ""} onChange={(e) => updateArticle({ byline: e.target.value })} placeholder="Por Oscar Trujillo · 5 min de lectura" />
        </div>
      </Section>

      <Section title="Promo blog (opcional)">
        <div>
          <label className={LABEL}>Título</label>
          <input className={INPUT} value={v.blogPromo?.title ?? ""} onChange={(e) => updateBlog({ title: e.target.value })} placeholder="100 ejercicios para mantener tu cerebro activo" />
        </div>
        <div>
          <label className={LABEL}>URL</label>
          <input className={INPUT} value={v.blogPromo?.url ?? ""} onChange={(e) => updateBlog({ url: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className={LABEL}>Excerpt</label>
          <textarea className={`${INPUT} resize-y min-h-[60px]`} value={v.blogPromo?.excerpt ?? ""} onChange={(e) => updateBlog({ excerpt: e.target.value })} />
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
                <input className={INPUT} placeholder="The Lancet · 2026" value={n.publication} onChange={(e) => updateNews(i, { publication: e.target.value })} />
                <input className={INPUT} placeholder="URL" value={n.url} onChange={(e) => updateNews(i, { url: e.target.value })} />
              </div>
              <input className={`${INPUT} mt-2`} placeholder="Titular" value={n.title} onChange={(e) => updateNews(i, { title: e.target.value })} />
              <textarea className={`${INPUT} mt-2 resize-y min-h-[60px]`} placeholder="Descripción (soporta **bold** y *italic*)" value={n.description} onChange={(e) => updateNews(i, { description: e.target.value })} />
            </div>
          ))}
          <button onClick={addNews} className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-[var(--c-border)] px-3 py-1.5 text-[12px] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]">
            <Plus className="h-3.5 w-3.5" /> Añadir noticia
          </button>
        </div>
      </Section>

      <Section title="CTA oscura / ebook (opcional)">
        <div>
          <label className={LABEL}>Eyebrow</label>
          <input className={INPUT} value={v.ebookCta?.eyebrow ?? ""} onChange={(e) => updateEbook({ eyebrow: e.target.value })} placeholder="Descarga gratuita" />
        </div>
        <div>
          <label className={LABEL}>Título</label>
          <input className={INPUT} value={v.ebookCta?.title ?? ""} onChange={(e) => updateEbook({ title: e.target.value })} placeholder="7 días, 7 retos mentales" />
        </div>
        <div>
          <label className={LABEL}>Descripción</label>
          <textarea className={`${INPUT} resize-y min-h-[60px]`} value={v.ebookCta?.description ?? ""} onChange={(e) => updateEbook({ description: e.target.value })} />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label className={LABEL}>URL</label>
            <input className={INPUT} value={v.ebookCta?.url ?? ""} onChange={(e) => updateEbook({ url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className={LABEL}>Texto del botón</label>
            <input className={INPUT} style={{ width: "220px" }} value={v.ebookCta?.ctaLabel ?? ""} onChange={(e) => updateEbook({ ctaLabel: e.target.value })} placeholder="Descargar gratis →" />
          </div>
        </div>
      </Section>

      <Section title="Texto libre (markdown, opcional)">
        <textarea
          className={`${INPUT} resize-y min-h-[120px] font-mono text-[12px]`}
          placeholder={"## Subtítulo\n\nPárrafo con **bold** e *italic*.\n\n- Item uno\n- Item dos"}
          value={v.freeMarkdown ?? ""}
          onChange={(e) => update("freeMarkdown", e.target.value)}
        />
      </Section>

      <Section title="Una idea para llevar (cita)">
        <textarea
          className={`${INPUT} resize-y min-h-[60px]`}
          placeholder="El Alzheimer no empieza con el primer olvido..."
          value={v.quote ?? ""}
          onChange={(e) => update("quote", e.target.value)}
        />
      </Section>

      <Section title="Firma">
        <div>
          <label className={LABEL}>Texto de despedida</label>
          <textarea className={`${INPUT} resize-y min-h-[80px]`} value={v.signatureIntro ?? ""} onChange={(e) => update("signatureIntro", e.target.value)} placeholder="Gracias por leer Esponjosos. Si esta edición te hizo ver algo familiar de una forma distinta, ya hicimos nuestro trabajo.&#10;&#10;Hasta el próximo lunes." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Nombre</label>
            <input className={INPUT} value={v.signature ?? ""} onChange={(e) => update("signature", e.target.value)} placeholder="Oscar & Stephanie" />
          </div>
          <div>
            <label className={LABEL}>Rol / organización</label>
            <input className={INPUT} value={v.signatureRole ?? ""} onChange={(e) => update("signatureRole", e.target.value)} placeholder="Cerebros Esponjosos" />
          </div>
        </div>
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
