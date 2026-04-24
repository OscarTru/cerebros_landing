import { layout } from "../layout"
import {
  coverSection,
  articleSection,
  blogPromoSection,
  newsSection,
  ebookCtaSection,
  ideaSection,
  signSection,
} from "../components"
import { markdownToHtml } from "../markdown"
import type { EditionBlocks } from "../types"

export function renderEdition(ctx: { email: string; blocks: EditionBlocks }): string {
  const b = ctx.blocks
  const parts: string[] = []

  parts.push(
    coverSection({
      editionNumber: b.editionNumber,
      badge: b.badge ?? b.heroLabel ?? "Esponjosos",
      heroTitle: b.heroTitle,
      heroSubtitle: b.heroSubtitle,
      coverIntro: b.coverIntro,
    })
  )

  const inner: string[] = []
  if (b.article) inner.push(articleSection(b.article))
  if (b.blogPromo) inner.push(blogPromoSection(b.blogPromo))
  if (b.news && b.news.length > 0) inner.push(newsSection(b.news))
  if (b.ebookCta) inner.push(ebookCtaSection(b.ebookCta))
  if (b.freeMarkdown && b.freeMarkdown.trim()) {
    inner.push(`<div class="free-md">${markdownToHtml(b.freeMarkdown)}</div>`)
  }
  if (b.quote) inner.push(ideaSection(b.quote))
  inner.push(
    signSection({
      intro: b.signatureIntro,
      name: b.signature,
      role: b.signatureRole,
    })
  )

  parts.push(`<div class="body-wrap">${inner.join("")}</div>`)

  return layout({
    title: b.heroTitle,
    email: ctx.email,
    preheader: b.heroSubtitle ?? b.coverIntro ?? b.heroTitle,
    issueDate: b.issueDate,
    bodyHtml: parts.join("\n"),
  })
}
