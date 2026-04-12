// src/lib/readingTime.ts

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Converts a heading string into a URL-safe anchor ID.
 * Keeps accented characters (they work fine as HTML IDs).
 * Lowercases, replaces spaces with hyphens, strips punctuation.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u00C0-\u024F-]/g, "")
}

/**
 * Strips MDX/Markdown syntax and frontmatter, then estimates
 * reading time at 200 words per minute (Spanish average).
 * Returns at least 1 minute.
 */
export function calcReadingTime(raw: string): number {
  // Remove frontmatter block (--- ... ---)
  const withoutFrontmatter = raw.replace(/^---[\s\S]*?---/, "")
  // Remove markdown/MDX syntax
  const plainText = withoutFrontmatter
    .replace(/```[\s\S]*?```/g, "")   // fenced code blocks
    .replace(/`[^`]*`/g, "")          // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "")  // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")   // links — keep visible text, strip URL
    .replace(/#{1,6}\s/g, "")         // headings
    .replace(/[*_~>]/g, "")           // emphasis, blockquote
    .replace(/<[^>]+>/g, "")          // HTML tags
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Parses ## and ### headings from raw MDX content (after frontmatter).
 * Returns them in document order with slugified IDs.
 */
export function extractHeadings(raw: string): Heading[] {
  const withoutFrontmatter = raw.replace(/^---[\s\S]*?---/, "")
  const lines = withoutFrontmatter.split("\n")
  const headings: Heading[] = []
  for (const line of lines) {
    const h2 = line.match(/^##(?!#)\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      headings.push({ id: slugify(h3[1]), text: h3[1].trim(), level: 3 })
    } else if (h2) {
      headings.push({ id: slugify(h2[1]), text: h2[1].trim(), level: 2 })
    }
  }
  return headings
}
