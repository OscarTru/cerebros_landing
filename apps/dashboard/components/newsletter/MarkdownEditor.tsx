"use client"
import { Bold, Italic, Link2, Heading2, List } from "lucide-react"
import { useRef } from "react"

interface Props {
  value: string
  onChange: (v: string) => void
}

export function MarkdownEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function wrap(before: string, after: string) {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const e = el.selectionEnd
    const sel = value.slice(s, e)
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, e + before.length) })
  }

  function insertAtLineStart(prefix: string) {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const before = value.slice(0, s).split("\n")
    before[before.length - 1] = prefix + before[before.length - 1]
    const next = before.join("\n") + value.slice(s)
    onChange(next)
  }

  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      <div className="flex items-center gap-1 border-b border-[var(--c-border)] px-3 py-2">
        <ToolBtn onClick={() => wrap("**", "**")} icon={Bold} label="Bold" />
        <ToolBtn onClick={() => wrap("*", "*")} icon={Italic} label="Italic" />
        <ToolBtn onClick={() => wrap("[", "](https://)")} icon={Link2} label="Link" />
        <ToolBtn onClick={() => insertAtLineStart("## ")} icon={Heading2} label="H2" />
        <ToolBtn onClick={() => insertAtLineStart("- ")} icon={List} label="List" />
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"## Título\n\nEscribe aquí con **markdown**..."}
        className="w-full resize-y p-4 text-[13px] font-mono text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none min-h-[420px] bg-transparent"
      />
    </div>
  )
}

function ToolBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button onClick={onClick} title={label} className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]">
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}
