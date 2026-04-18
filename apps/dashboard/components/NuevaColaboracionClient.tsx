"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--c-surface)",
  border: "1px solid var(--c-border)",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "13px",
  color: "var(--c-text)",
  outline: "none",
  fontFamily: "inherit",
}

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--c-text)",
  marginBottom: "6px",
  display: "block",
}

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
    <div style={{ padding: "32px", maxWidth: "560px", width: "100%" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "13px",
          }}>
            {error}
          </div>
        )}

        <div>
          <label style={labelStyle}>Marca *</label>
          <input name="marca" required placeholder="Nombre de la marca" style={fieldStyle} />
        </div>

        <div>
          <label style={labelStyle}>Tipo *</label>
          <select name="tipo" required style={fieldStyle}>
            {["reels", "stories", "post_estatico", "podcast", "newsletter", "paquete"].map(t => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Estado</label>
          <select name="estado" defaultValue="prospecto" style={fieldStyle}>
            {["prospecto", "en_negociacion", "confirmada", "cerrada"].map(e => (
              <option key={e} value={e}>{e.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Valor (MXN)</label>
          <input name="valor_mxn" type="number" placeholder="0.00" style={fieldStyle} />
        </div>

        <div>
          <label style={labelStyle}>Nombre del contacto</label>
          <input name="contacto_nombre" placeholder="Ana López" style={fieldStyle} />
        </div>

        <div>
          <label style={labelStyle}>Email del contacto</label>
          <input name="contacto_email" type="email" placeholder="ana@marca.com" style={fieldStyle} />
        </div>

        <div>
          <label style={labelStyle}>Notas</label>
          <textarea
            name="notas"
            rows={3}
            placeholder="Propuesta, condiciones, detalles..."
            style={{ ...fieldStyle, resize: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "10px",
              background: "var(--c-invert)",
              color: "var(--c-invert-fg)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Guardando..." : "Crear colaboración"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "10px",
              background: "transparent",
              color: "var(--c-text-muted)",
              border: "1px solid var(--c-border)",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
