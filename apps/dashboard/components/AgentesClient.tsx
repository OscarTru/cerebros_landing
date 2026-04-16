"use client"
import { useState } from "react"
import { Button } from "@cerebros/ui"
import { Input } from "@cerebros/ui"
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
    <div className="p-6 flex flex-col h-full max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl">
          <Bot className="w-5 h-5 text-[var(--c-text-muted)]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--c-text)]">Análisis de métricas</h2>
          <p className="text-sm text-[var(--c-text-muted)]">
            Pregúntale a Claude sobre tu contenido y audiencia
          </p>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="text-left text-sm text-[var(--c-text-muted)] bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-4 py-3 hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                  : "bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--c-text-muted)]" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar(input)
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo sobre tus métricas..."
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
