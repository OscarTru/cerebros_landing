export interface Heading {
  id: string
  text: string
  level: number
}

// Lowercase + reemplazar espacios por -, quitar tildes, quitar caracteres no [a-z0-9-].
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Palabras / 200 wpm, min 1.
export function readingTimeMinutes(content: string): number {
  if (!content) return 1
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

// Extrae headings nivel 1-3 de markdown.
// Los #### o mayores se ignoran.
export function parseHeadings(content: string): Heading[] {
  const lines = content.split("\n")
  const headings: Heading[] = []
  let inCodeBlock = false
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    const m = line.match(/^(#{1,3})\s+(.+?)\s*$/)
    if (!m) continue
    const level = m[1].length
    const text = m[2].trim()
    headings.push({ id: slugify(text), text, level })
  }
  return headings
}
