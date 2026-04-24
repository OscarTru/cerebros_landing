"use client"
import { useRef, useState } from "react"
import { Image as ImageIcon, Loader2 } from "lucide-react"

interface Props {
  onUploaded: (cloudinaryId: string) => void
}

export function ImageUploadButton({ onUploaded }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // reset para poder subir misma imagen 2 veces
    if (!file) return

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloud || !preset) {
      setError("Cloudinary no configurado")
      return
    }

    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("upload_preset", preset)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: "POST",
        body: fd,
      })
      const json = await res.json()
      if (!res.ok || !json.public_id) {
        setError(json.error?.message ?? "Error al subir")
        return
      }
      onUploaded(json.public_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red")
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        title={error ?? "Subir imagen"}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)] disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </>
  )
}
