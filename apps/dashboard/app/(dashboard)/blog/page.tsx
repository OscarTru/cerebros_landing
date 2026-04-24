import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { BlogPostList, type BlogPostListItem } from "@/components/blog/BlogPostList"
import { BlogHeaderActions } from "./BlogHeaderActions"

interface PageData {
  drafts: BlogPostListItem[]
  published: BlogPostListItem[]
  totals: { drafts: number; published: number; pending: number }
}

async function getData(): Promise<PageData> {
  const { data } = await getSupabase()
    .from("blog_posts")
    .select("id, slug, title, description, author, status, views, updated_at, published_at")
    .order("updated_at", { ascending: false })
    .limit(200)
  const items = (data ?? []) as BlogPostListItem[]
  const drafts = items.filter((p) => p.status === "draft")
  const published = items.filter((p) => p.status === "published")
  return {
    drafts,
    published,
    totals: {
      drafts: drafts.length,
      published: published.length,
      // Reserved for future "pending approval" workflow similar to newsletter
      pending: 0,
    },
  }
}

export default async function BlogDashboardPage() {
  const { drafts, published, totals } = await getData()

  return (
    <>
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · BLOG · ESPACIO DE TRABAJO ·
          </p>
          <h1 className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {totals.drafts} borrador{totals.drafts === 1 ? "" : "es"}{" "}
            <span className="text-[var(--c-text-muted)]">en proceso.</span>
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
            Aquí escribes y editas. Para ver publicados, calendario y stats completas, ve a{" "}
            <Link href="/contenido" className="underline hover:text-[var(--c-text)]">
              Contenido →
            </Link>
          </p>
        </div>
        <BlogHeaderActions />
      </div>

      <div className="flex flex-col gap-6 p-8">
        {/* Borradores — foco principal de esta vista */}
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[13px] font-medium text-[var(--c-text)]">Borradores</p>
            {drafts.length > 0 && (
              <p className="text-[11px] text-[var(--c-text-muted)]">{drafts.length} activos</p>
            )}
          </div>
          <BlogPostList items={drafts} />
        </div>

        {/* Últimos publicados — solo 3 como resumen */}
        {published.length > 0 && (
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-[var(--c-text)]">Últimos publicados</p>
              <Link
                href="/contenido"
                className="inline-flex items-center gap-1 text-[11px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
              >
                Ver los {totals.published} en Contenido <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <BlogPostList items={published.slice(0, 3)} />
          </div>
        )}
      </div>
    </>
  )
}
