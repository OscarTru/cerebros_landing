export interface Heading {
  id: string
  text: string
  level: number
}

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
  image?: string
  readingTime: number
  headings: Heading[]
}

// ─── Dashboard types ────────────────────────────────────────────

export type ColaboracionEstado =
  | "prospecto"
  | "en_negociacion"
  | "confirmada"
  | "cerrada"

export type ColaboracionTipo =
  | "reels"
  | "stories"
  | "post_estatico"
  | "podcast"
  | "newsletter"
  | "paquete"

export interface Colaboracion {
  id: string
  marca: string
  tipo: ColaboracionTipo
  valor_mxn: number | null
  estado: ColaboracionEstado
  notas: string | null
  contacto_nombre: string | null
  contacto_email: string | null
  fecha_inicio: string | null
  fecha_cierre: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  nombre: string | null
  confirmed: boolean
  created_at: string
}

export interface AgentLog {
  id: string
  tipo: "analisis_metricas" | "respuesta_comentario" | "sugerencia_colaboracion"
  input: string
  output: string
  modelo: string
  tokens_input: number
  tokens_output: number
  created_at: string
}
