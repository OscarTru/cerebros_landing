"use client"
import { useState } from "react"
import { Bot, Send, Loader2, Plus, Sparkles, LineChart, Briefcase } from "lucide-react"
import { Button, Input } from "@heroui/react"
import { motion } from "framer-motion"
import { cn } from "@cerebros/lib"
import { TwoColumnLayout } from "./ui/TwoColumnLayout"
import { InfoCard } from "./ui/InfoCard"

interface Message {
  role: "user" | "assistant"
  content: string
}

const PRESETS = [
  {
    icon: LineChart,
    title: "Análisis semanal",
    prompt: "Haz un resumen de las métricas clave de esta semana",
  },
  {
    icon: Sparkles,
    title: "Estrategia de contenido",
    prompt: "Sugiere 5 temas de contenido basados en mis posts más populares",
  },
  {
    icon: Briefcase,
    title: "Review colaboraciones",
    prompt: "¿Qué colaboraciones debo priorizar esta semana?",
  },
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

  function resetChat() {
    setMessages([])
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <TwoColumnLayout
        leftWidth="narrow"
        left={
          <div className="flex flex-col gap-3">
            <Button
              variant="flat"
              startContent={<Plus className="h-3.5 w-3.5" />}
              className="justify-start rounded-xl bg-[var(--c-surface)] text-[13px]"
              onPress={resetChat}
            >
              Nueva conversación
            </Button>

            <InfoCard title="Presets" padded={false}>
              <div className="flex flex-col">
                {PRESETS.map((p) => (
                  <button
                    key={p.title}
                    onClick={() => enviar(p.prompt)}
                    className="flex items-start gap-3 border-b border-[var(--c-border)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--c-surface-2)]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)]">
                      <p.icon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-[var(--c-text)]">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--c-text-muted)]">
                        {p.prompt.slice(0, 50)}...
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </InfoCard>
          </div>
        }
        right={
          <div className="flex min-h-[520px] flex-col rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 border-b border-[var(--c-border)] px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)]">
                <Bot className="h-4 w-4 text-[var(--c-text-muted)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--c-text)]">Claude</p>
                <p className="text-[11px] text-[var(--c-text-muted)]">
                  Análisis de métricas
                </p>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                        : "border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text)]"
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--c-text-muted)]" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                enviar(input)
              }}
              className="flex gap-2 border-t border-[var(--c-border)] p-3"
            >
              <Input
                value={input}
                onValueChange={setInput}
                placeholder="Pregunta algo sobre tus métricas..."
                isDisabled={loading}
                classNames={{
                  inputWrapper:
                    "bg-[var(--c-surface-2)] border border-[var(--c-border)] shadow-none",
                  input: "text-[13px]",
                }}
              />
              <Button
                type="submit"
                color="primary"
                isIconOnly
                isDisabled={loading || !input.trim()}
                className="rounded-xl"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        }
      />
    </div>
  )
}
