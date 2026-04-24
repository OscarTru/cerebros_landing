"use client"
import { useState } from "react"
import {
  Send,
  Loader2,
  Plus,
  Sparkles,
  LineChart,
  Briefcase,
  Mic,
  Mail,
  Clock,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@cerebros/lib"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface HistoryItem {
  id: string
  title: string
  timestamp: Date
}

const PRESETS = [
  {
    icon: LineChart,
    title: "Resumen semanal",
    description: "Qué pasó en las 4 plataformas",
    prompt: "Haz un resumen de las métricas clave de esta semana",
  },
  {
    icon: Sparkles,
    title: "Ideas de contenido",
    description: "5 temas según lo que funciona",
    prompt: "Sugiere 5 temas de contenido basados en mis posts más populares",
  },
  {
    icon: Briefcase,
    title: "Review colabs",
    description: "Cuál priorizar esta semana",
    prompt: "¿Qué colaboraciones debo priorizar esta semana?",
  },
  {
    icon: Mic,
    title: "Notas de podcast",
    description: "Desmenuzando — prep. del próximo episodio",
    prompt: "Ayúdame a preparar el próximo episodio del podcast",
  },
  {
    icon: Mail,
    title: "Borrador newsletter",
    description: "Tu voz, tus datos, tu draft",
    prompt: "Escribe un borrador para el próximo número del newsletter",
  },
]

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return `Hace ${Math.floor(hrs / 24)} días`
}

export function AgentesClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

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

  function nuevaConversacion() {
    if (messages.length > 0) {
      const firstUser = messages.find((m) => m.role === "user")
      const title = firstUser ? firstUser.content.slice(0, 45) : "Conversación"
      setHistory((prev) => [
        { id: crypto.randomUUID(), title, timestamp: new Date() },
        ...prev,
      ].slice(0, 10))
    }
    setMessages([])
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Page header */}
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · AGENTES · ALIIS ·
          </p>
          <h1 className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            Habla con tus{" "}
            <span className="text-[var(--c-text-muted)]">métricas.</span>
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
            Aliis lee tu data de Supabase, IG, YouTube y blog — y responde con citas.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={nuevaConversacion}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva conversación
          </button>
        </div>
      </div>

      {/* Body: sidebar + chat */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex w-[260px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-[var(--c-border)] px-4 py-5">
          {/* Presets */}
          <div>
            <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              · PRESETS ·
            </p>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.title}
                  onClick={() => enviar(p.prompt)}
                  className="flex items-start gap-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-3 text-left transition-colors hover:bg-[var(--c-surface-3)]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <p.icon className="h-3.5 w-3.5 text-[var(--c-brand-teal,#14b8a6)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[var(--c-text)]">{p.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--c-text-muted)]">
                      {p.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Historial */}
          {history.length > 0 && (
            <div>
              <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
                · HISTORIAL ·
              </p>
              <div className="flex flex-col gap-1.5">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-3"
                  >
                    <p className="truncate text-[12px] font-medium text-[var(--c-text)]">
                      {h.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--c-text-muted)]">
                      {formatRelative(h.timestamp)} · Aliis
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className="flex min-h-0 flex-1 flex-col bg-[var(--c-surface)]">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-[var(--c-border)] px-6 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[11px] font-bold text-[var(--c-text-muted)]">
              A
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[var(--c-text)]">
                Aliis{" "}
                <span className="font-normal text-[var(--c-text-muted)]">
                  — tu analista de contenido
                </span>
              </p>
              <p className="text-[11px] text-[var(--c-text-muted)]">
                Contexto: IG 30d · YouTube 30d · Blog · Colabs
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              en línea
            </span>
          </div>

          {/* Messages */}
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            {messages.length === 0 && (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-center text-[13px] text-[var(--c-text-muted)]">
                  Elige un preset o escribe tu pregunta abajo.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "user" ? (
                  <div className="max-w-[70%] rounded-2xl bg-[var(--c-invert)] px-5 py-3 text-[13px] leading-relaxed text-[var(--c-invert-fg)]">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-6 py-5">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--c-text)]">
                      {m.content}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-5 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--c-text-muted)]" />
                  <span className="text-[12px] text-[var(--c-text-muted)]">Aliis está pensando…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--c-border)] p-4">
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
                className="flex-1 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2.5 text-[13px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--c-invert)] text-[var(--c-invert-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
