"use client"
import { useState } from "react"
import { Bell, Plus } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent, Button } from "@heroui/react"
import { AttentionQueue, type AttentionItem } from "@/components/ui/AttentionQueue"
import { PublishModal } from "@/components/ui/PublishModal"

interface Props {
  attentionItems: AttentionItem[]
}

export function OverviewHeaderActions({ attentionItems }: Props) {
  const [publishOpen, setPublishOpen] = useState(false)
  const count = attentionItems.length

  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        <Popover placement="bottom-end" offset={8}>
          <PopoverTrigger>
            <Button
              variant="flat"
              size="sm"
              disableRipple
              aria-label={`Notificaciones (${count})`}
              className="min-w-0 h-9 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3.5 text-[12px] font-medium text-[var(--c-text-muted)] data-[hover=true]:bg-[var(--c-surface-3)]"
              startContent={<Bell className="h-3.5 w-3.5" />}
            >
              {count}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[360px] max-w-[92vw]">
            <AttentionQueue items={attentionItems} />
          </PopoverContent>
        </Popover>

        <button
          onClick={() => setPublishOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--c-invert)] px-4 text-[12px] font-medium text-[var(--c-invert-fg)] hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          Publicar algo
        </button>
      </div>

      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />
    </>
  )
}
