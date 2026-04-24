import type { DraftShape } from "./types"
import { renderEdition } from "./templates/edition"
import { renderCustom } from "./templates/custom"
import { markdownToHtml } from "./markdown"
import { layout } from "./layout"

export function renderFromDraft(ctx: { email: string; draft: DraftShape }): string {
  const d = ctx.draft
  switch (d.mode) {
    case "blocks":
      if (!d.blocks) return renderEmpty(ctx.email, d.subject)
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
