"use client"
import { useState } from "react"
import { Bot, Send, Loader2 } from "lucide-react"
import { cn } from "@cerebros/lib"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGERENCIAS = [
  "¿Qué contenido funcionó mejor este mes?",
  "¿Cuáles colaboraciones debo priorizar?",
  "¿Cómo está creciendo mi newsletter?",
  "Sugiere temas para los próximos posts",
]

export function AgentesClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

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
    <div className="flex-1 p-8 flex flex-col max-w-3xl w-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--c-surface)] border border-[var(--c-border)]">
          <Bot className="w-[18px] h-[18px] text-[var(--c-text-muted)]" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--c-text)]">
            Análisis de métricas
          </h2>
          <p className="text-[13px] text-[var(--c-text-muted)] mt-0.5">
            Pregúntale a Claude sobre tu contenido y audiencia
          </p>
        </div>
      </div>

      {/* Sugerencias */}
      {messages.length === 0 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="text-left text-[13px] text-[var(--c-text-muted)] px-4 py-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-4 mb-4 overflow-y-auto min-h-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                  : "bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)]"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center px-4 py-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
              <Loader2 className="w-4 h-4 text-[var(--c-text-muted)] animate-spin" />
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
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo sobre tus métricas..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl text-[13px] bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-border-strong)]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--c-invert)] text-[var(--c-invert-fg)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}
