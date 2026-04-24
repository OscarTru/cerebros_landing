import { notFound } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { getUserRole } from "@/lib/clerk"
import { EditorClient, type DraftRow } from "./EditorClient"

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [role, draft] = await Promise.all([
    getUserRole(),
    loadDraft(id),
  ])
  if (!draft) notFound()
  return <EditorClient initialDraft={draft} role={role} />
}

async function loadDraft(id: string): Promise<DraftRow | null> {
  const { data } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, mode, blocks, markdown, html, status, created_by, approved_by, updated_at")
    .eq("id", id)
    .maybeSingle()
  return (data as DraftRow | null) ?? null
}
