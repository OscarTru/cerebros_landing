"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Select, SelectItem, Button } from "@heroui/react"
import { InfoCard } from "./ui/InfoCard"
import { StaggerList } from "./ui/effects/StaggerList"

const inputClassNames = {
  inputWrapper:
    "bg-[var(--c-surface-2)] border border-[var(--c-border)] shadow-none data-[hover=true]:border-[var(--c-border-strong)] group-data-[focus=true]:border-[var(--c-border-strong)]",
  input: "text-[13px]",
  label: "text-xs text-[var(--c-text-muted)]",
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
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-5">
      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-500">
          {error}
        </div>
      )}

      <StaggerList staggerDelay={0.08} className="flex flex-col gap-5">
        <InfoCard title="Información básica">
          <div className="flex flex-col gap-4">
            <Input
              name="marca"
              label="Marca"
              placeholder="Nombre de la marca"
              isRequired
              classNames={inputClassNames}
              labelPlacement="outside"
            />
            <Select
              name="tipo"
              label="Tipo"
              placeholder="Selecciona un tipo"
              isRequired
              classNames={{
                trigger: inputClassNames.inputWrapper,
                label: inputClassNames.label,
                value: "text-[13px]",
              }}
              labelPlacement="outside"
            >
              {["reels", "stories", "post_estatico", "podcast", "newsletter", "paquete"].map(
                (t) => (
                  <SelectItem key={t}>{t.replace("_", " ")}</SelectItem>
                )
              )}
            </Select>
            <Select
              name="estado"
              label="Estado"
              defaultSelectedKeys={["prospecto"]}
              classNames={{
                trigger: inputClassNames.inputWrapper,
                label: inputClassNames.label,
                value: "text-[13px]",
              }}
              labelPlacement="outside"
            >
              {["prospecto", "en_negociacion", "confirmada", "cerrada"].map((e) => (
                <SelectItem key={e}>{e.replace("_", " ")}</SelectItem>
              ))}
            </Select>
          </div>
        </InfoCard>

        <InfoCard title="Detalles financieros">
          <Input
            name="valor_mxn"
            type="number"
            label="Valor (MXN)"
            placeholder="0.00"
            classNames={inputClassNames}
            labelPlacement="outside"
          />
        </InfoCard>

        <InfoCard title="Contacto">
          <div className="flex flex-col gap-4">
            <Input
              name="contacto_nombre"
              label="Nombre"
              placeholder="Ana López"
              classNames={inputClassNames}
              labelPlacement="outside"
            />
            <Input
              name="contacto_email"
              type="email"
              label="Email"
              placeholder="ana@marca.com"
              classNames={inputClassNames}
              labelPlacement="outside"
            />
          </div>
        </InfoCard>

        <InfoCard title="Notas">
          <Textarea
            name="notas"
            placeholder="Propuesta, condiciones, detalles..."
            minRows={3}
            classNames={inputClassNames}
          />
        </InfoCard>
      </StaggerList>

      <div className="flex gap-2.5 pt-2">
        <Button
          type="submit"
          color="primary"
          isLoading={loading}
          className="rounded-xl"
        >
          {loading ? "Guardando..." : "Crear colaboración"}
        </Button>
        <Button
          type="button"
          variant="flat"
          onPress={() => router.back()}
          className="rounded-xl"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
