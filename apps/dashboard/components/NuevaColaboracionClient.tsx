"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const fieldClass =
  "w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-border-strong)]"

const labelClass = "block text-xs font-medium text-[var(--c-text)] mb-1.5"

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
    <div className="p-8 max-w-xl w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="px-4 py-3 rounded-xl text-[13px] bg-red-500/10 border border-red-500/25 text-red-500">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Marca *</label>
          <input name="marca" required placeholder="Nombre de la marca" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Tipo *</label>
          <select name="tipo" required className={fieldClass}>
            {["reels", "stories", "post_estatico", "podcast", "newsletter", "paquete"].map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Estado</label>
          <select name="estado" defaultValue="prospecto" className={fieldClass}>
            {["prospecto", "en_negociacion", "confirmada", "cerrada"].map((e) => (
              <option key={e} value={e}>
                {e.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Valor (MXN)</label>
          <input name="valor_mxn" type="number" placeholder="0.00" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Nombre del contacto</label>
          <input name="contacto_nombre" placeholder="Ana López" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Email del contacto</label>
          <input name="contacto_email" type="email" placeholder="ana@marca.com" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea
            name="notas"
            rows={3}
            placeholder="Propuesta, condiciones, detalles..."
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[var(--c-invert)] text-[var(--c-invert-fg)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Crear colaboración"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-[var(--c-text-muted)] border border-[var(--c-border)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
