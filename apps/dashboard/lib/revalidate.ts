// Llama al endpoint /api/revalidate del landing con el secret compartido.
// Si WEB_URL o REVALIDATE_SECRET no están set, no-op silencioso (útil en dev sin secret todavía).

export async function revalidateLanding(paths: string[]): Promise<{ ok: boolean; error?: string }> {
  const webUrl = process.env.WEB_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!webUrl || !secret) {
    return { ok: false, error: "WEB_URL o REVALIDATE_SECRET no seteados" }
  }

  try {
    for (const path of paths) {
      const res = await fetch(`${webUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, secret }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        return { ok: false, error: `Revalidate ${path}: ${res.status} ${text.slice(0, 200)}` }
      }
    }
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    return { ok: false, error: msg }
  }
}
