"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useMemo } from "react"
import {
  Bold, Italic, Link2, Heading1, Heading2, Heading3,
  List, Quote, Minus, Code, Unlink,
} from "lucide-react"
import { cn } from "@cerebros/lib"
import { ImageUploadButton } from "./ImageUploadButton"
import { markdownToHtml } from "@/lib/blog/markdown-to-html"

interface Props {
  value: string
  onChange: (html: string) => void
}

export function BlogMarkdownEditor({ value, onChange }: Props) {
  // Value inicial: si es markdown legacy, se convierte a HTML una vez.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialContent = useMemo(() => markdownToHtml(value), [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "blog-link" },
      }),
      Image.configure({
        HTMLAttributes: { class: "blog-img" },
      }),
      Placeholder.configure({
        placeholder: "Empieza a escribir tu post...",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-prose outline-none min-h-[560px] px-6 py-5",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sincronizar si value cambia externamente y el editor está vacío
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML().replace(/\s+/g, "")
    if (current === "<p></p>" || current.length === 0) {
      const nextHtml = markdownToHtml(value)
      if (nextHtml.trim() !== "") {
        editor.commands.setContent(nextHtml, { emitUpdate: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) {
    return (
      <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] min-h-[600px] flex items-center justify-center text-[13px] text-[var(--c-text-muted)]">
        Cargando editor...
      </div>
    )
  }

  // editor is non-null past this point (narrowed by the guard above)
  const e = editor

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    e.isActive(name, attrs)

  function promptLink() {
    const prev = e.getAttributes("link").href as string | undefined
    const url = window.prompt("URL del link", prev ?? "https://")
    if (url === null) return
    if (url === "") {
      e.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    e.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  function handleImageUploaded(publicId: string) {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"
    const src = `https://res.cloudinary.com/${cloud}/image/upload/q_auto,f_auto,w_1200/${publicId}`
    e.chain().focus().setImage({ src, alt: "" }).run()
  }

  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-2 rounded-t-2xl">
        <ToolBtn
          onClick={() => e.chain().focus().toggleBold().run()}
          icon={Bold}
          label="Bold (⌘B)"
          active={isActive("bold")}
        />
        <ToolBtn
          onClick={() => e.chain().focus().toggleItalic().run()}
          icon={Italic}
          label="Italic (⌘I)"
          active={isActive("italic")}
        />
        <ToolBtn onClick={promptLink} icon={Link2} label="Link (⌘K)" active={isActive("link")} />
        {isActive("link") && (
          <ToolBtn
            onClick={() => e.chain().focus().unsetLink().run()}
            icon={Unlink}
            label="Quitar link"
          />
        )}
        <Divider />
        <ToolBtn
          onClick={() => e.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={Heading1}
          label="Título 1"
          active={isActive("heading", { level: 1 })}
        />
        <ToolBtn
          onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={Heading2}
          label="Título 2"
          active={isActive("heading", { level: 2 })}
        />
        <ToolBtn
          onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={Heading3}
          label="Título 3"
          active={isActive("heading", { level: 3 })}
        />
        <Divider />
        <ToolBtn
          onClick={() => e.chain().focus().toggleBulletList().run()}
          icon={List}
          label="Lista"
          active={isActive("bulletList")}
        />
        <ToolBtn
          onClick={() => e.chain().focus().toggleBlockquote().run()}
          icon={Quote}
          label="Cita"
          active={isActive("blockquote")}
        />
        <ToolBtn
          onClick={() => e.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          label="Separador"
        />
        <Divider />
        <ImageUploadButton onUploaded={handleImageUploaded} />
        <ToolBtn
          onClick={() => e.chain().focus().toggleCodeBlock().run()}
          icon={Code}
          label="Código"
          active={isActive("codeBlock")}
        />
      </div>

      <EditorContent editor={editor} />

      <style>{`
        .tiptap-prose { font-family: 'Inter', -apple-system, sans-serif; color: var(--c-text); max-width: 680px; margin: 0 auto; }
        .tiptap-prose h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 36px; line-height: 1.12; font-weight: 400; margin: 32px 0 14px; }
        .tiptap-prose h2 { font-family: 'Instrument Serif', Georgia, serif; font-size: 26px; line-height: 1.2; font-weight: 400; margin: 32px 0 10px; }
        .tiptap-prose h3 { font-family: 'Instrument Serif', Georgia, serif; font-size: 20px; line-height: 1.3; font-weight: 400; margin: 24px 0 8px; }
        .tiptap-prose p { font-size: 15.5px; line-height: 1.78; font-weight: 300; color: var(--c-text); margin: 12px 0; }
        .tiptap-prose strong { font-weight: 600; color: var(--c-text); }
        .tiptap-prose em { font-style: italic; }
        .tiptap-prose a, .tiptap-prose .blog-link { color: var(--c-text); text-decoration: underline; text-decoration-color: var(--c-text-muted); text-underline-offset: 3px; cursor: pointer; }
        .tiptap-prose code { background: var(--c-surface-2); padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: ui-monospace, Menlo, monospace; color: var(--c-text); }
        .tiptap-prose pre { background: var(--c-invert); color: var(--c-invert-fg); padding: 16px 18px; border-radius: 10px; overflow-x: auto; font-size: 12.5px; font-family: ui-monospace, Menlo, monospace; margin: 18px 0; }
        .tiptap-prose pre code { background: transparent; padding: 0; color: inherit; }
        .tiptap-prose ul { padding-left: 22px; margin: 14px 0; }
        .tiptap-prose ul li { font-size: 15.5px; line-height: 1.78; font-weight: 300; margin: 6px 0; }
        .tiptap-prose blockquote { border-left: 3px solid var(--c-text); padding-left: 18px; margin: 22px 0; font-style: italic; font-size: 17px; line-height: 1.7; color: var(--c-text-muted); }
        .tiptap-prose hr { border: 0; border-top: 1px solid var(--c-border); margin: 36px 0; }
        .tiptap-prose img, .tiptap-prose .blog-img { max-width: 100%; height: auto; margin: 24px 0; border-radius: 10px; display: block; }
        .tiptap-prose p.is-editor-empty:first-child::before { color: var(--c-text-faint); content: attr(data-placeholder); float: left; height: 0; pointer-events: none; font-style: italic; }
        .tiptap-prose .ProseMirror-focused { outline: none; }
      `}</style>
    </div>
  )
}

function ToolBtn({
  onClick,
  icon: Icon,
  label,
  active,
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
          : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

function Divider() {
  return <div className="mx-1 h-4 w-px bg-[var(--c-border)]" />
}
