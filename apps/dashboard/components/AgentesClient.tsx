"use client"
import { useState } from "react"
import { Bot, Send, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AgentesClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const SUGERENCIAS = [
    "¿Qué contenido funcionó mejor este mes?",
    "¿Cuáles colaboraciones debo priorizar?",
    "¿Cómo está creciendo mi newsletter?",
    "Sugiere temas para los próximos posts",
  ]

  async function enviar(pregunta: string) {
    if (!pregunta.trim() || loading) return
    setInput("")
    setLoading(true)

    setMessages((prev) => [...prev, { role: "user", content: pregunta }])

    const res = await fetch("/api/agentes/analiza", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta }),
    })

    const data = await res.json()
    const respuesta = res.ok ? data.respuesta : "Error al obtener respuesta."

    setMessages((prev) => [...prev, { role: "assistant", content: respuesta }])
    setLoading(false)
  }

  return (
    <div style={{
      padding: "32px",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      maxWidth: "720px",
      width: "100%",
      minHeight: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Bot style={{ width: 18, height: 18, color: "var(--c-text-muted)" }} />
        </div>
        <div>
          <h2 style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--c-text)",
            letterSpacing: "-0.01em",
            margin: 0,
          }}>
            Análisis de métricas
          </h2>
          <p style={{ fontSize: "13px", color: "var(--c-text-muted)", margin: 0, marginTop: "2px" }}>
            Pregúntale a Claude sobre tu contenido y audiencia
          </p>
        </div>
      </div>

      {/* Sugerencias */}
      {messages.length === 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "24px",
        }}>
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              style={{
                textAlign: "left",
                fontSize: "13px",
                color: "var(--c-text-muted)",
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: "12px",
                padding: "12px 16px",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--c-border-strong)"
                ;(e.currentTarget as HTMLButtonElement).style.color = "var(--c-text)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--c-border)"
                ;(e.currentTarget as HTMLButtonElement).style.color = "var(--c-text-muted)"
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "16px",
        overflowY: "auto",
        minHeight: 0,
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{
              maxWidth: "85%",
              borderRadius: "16px",
              padding: "12px 16px",
              fontSize: "13px",
              lineHeight: 1.5,
              background: m.role === "user" ? "var(--c-invert)" : "var(--c-surface)",
              color: m.role === "user" ? "var(--c-invert-fg)" : "var(--c-text)",
              border: m.role === "user" ? "none" : "1px solid var(--c-border)",
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "16px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
            }}>
              <Loader2 style={{ width: 16, height: 16, color: "var(--c-text-muted)", animation: "spin 1s linear infinite" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar(input)
        }}
        style={{ display: "flex", gap: "8px" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo sobre tus métricas..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            color: "var(--c-text)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "10px",
            background: "var(--c-invert)",
            color: "var(--c-invert-fg)",
            border: "none",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          <Send style={{ width: 14, height: 14 }} />
        </button>
      </form>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
