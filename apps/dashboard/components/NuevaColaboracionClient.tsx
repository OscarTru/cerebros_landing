"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@cerebros/ui"
import { Input } from "@cerebros/ui"

export function NuevaColaboracionClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      marca: form.get("marca") as string,
      tipo: form.get("tipo") as string,
      valor_mxn: form.get("valor_mxn") ? Number(form.get("valor_mxn")) : null,
      estado: form.get("estado") as string,
      notas: (form.get("notas") as string) || null,
      contacto_nombre: (form.get("contacto_nombre") as string) || null,
      contacto_email: (form.get("contacto_email") as string) || null,
    }

    const res = await fetch("/api/colaboraciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/colaboraciones")
    } else {
      const data = await res.json()
      setError(JSON.stringify(data.error))
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--c-text)]">Marca *</label>
          <Input name="marca" required placeholder="Nombre de la marca" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--c-text)]">Tipo *</label>
          <select
            name="tipo"
            required
            className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)]"
          >
            {["reels", "stories", "post_estatico", "podcast", "newsletter", "paquete"].map(
              (t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              )
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--c-text)]">Estado</label>
          <select
            name="estado"
            defaultValue="prospecto"
            className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)]"
          >
            {["prospecto", "en_negociacion", "confirmada", "cerrada"].map((e) => (
              <option key={e} value={e}>
                {e.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--c-text)]">Valor (MXN)</label>
          <Input name="valor_mxn" type="number" placeholder="0.00" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--c-text)]">Nombre del contacto</label>
          <Input name="contacto_nombre" placeholder="Ana López" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--c-text)]">Email del contacto</label>
          <Input name="contacto_email" type="email" placeholder="ana@marca.com" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--c-text)]">Notas</label>
          <textarea
            name="notas"
            rows={3}
            placeholder="Propuesta, condiciones, detalles..."
            className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear colaboración"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
