import fs from "node:fs"
import path from "node:path"
import type { PostMeta, Heading } from "@cerebros/lib"

export type { PostMeta, Heading }

const BLOG_DIR = path.join(process.cwd(), "content/blog")

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const yaml = match[1]
  const result: Record<string, unknown> = {}
  for (const line of yaml.split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const rawVal = line.slice(colonIdx + 1).trim()
    if (!key) continue
    // Strip quotes
    if ((rawVal.startsWith('"') && rawVal.endsWith('"')) ||
        (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
      result[key] = rawVal.slice(1, -1)
    } else if (rawVal === "true") {
      result[key] = true
    } else if (rawVal === "false") {
      result[key] = false
    } else if (!isNaN(Number(rawVal)) && rawVal !== "") {
      result[key] = Number(rawVal)
    } else {
      result[key] = rawVal
    }
  }
  return result
}

function parseHeadings(yaml: string): Heading[] {
  const headingsMatch = yaml.match(/^headings:\s*\n((?:\s+-\s+\{[^\n]+\}\n?)*)/m)
  if (!headingsMatch) return []
  const lines = headingsMatch[1].split("\n").filter(Boolean)
  return lines
    .map((line) => {
      const m = line.match(/\{\s*id:\s*"([^"]+)",\s*text:\s*"([^"]+)",\s*level:\s*(\d+)\s*\}/)
      if (!m) return null
      return { id: m[1], text: m[2], level: Number(m[3]) }
    })
    .filter((h): h is Heading => h !== null)
}

let _posts: PostMeta[] | null = null

export function getAllPosts(): PostMeta[] {
  if (_posts) return _posts
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))

  const posts = files
    .map((file) => {
      const slug = file.replace(".mdx", "")
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8")
      const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      if (!frontmatterMatch) return null
      const yamlBlock = frontmatterMatch[1]
      const f = parseFrontmatter(raw) as Partial<PostMeta>
      if (!f.slug) return null
      const headings = parseHeadings(yamlBlock)
      return {
        ...f,
        slug: f.slug,
        title: f.title ?? "",
        date: f.date ?? "",
        description: f.description ?? "",
        author: f.author ?? "",
        readingTime: f.readingTime ?? 1,
        headings,
      } satisfies PostMeta
    })
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  _posts = posts
  return posts
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug)
}

export function getPostBySlug(slug: string): PostMeta | undefined {
  return getAllPosts().find((p) => p.slug === slug)
}

export function getAdjacentPosts(slug: string): {
  prevPost?: { slug: string; title: string }
  nextPost?: { slug: string; title: string }
} {
  const posts = getAllPosts()
  const slugs = posts.map((p) => p.slug)
  const idx = slugs.indexOf(slug)
  return {
    prevPost: idx > 0 ? { slug: slugs[idx - 1], title: posts[idx - 1].title } : undefined,
    nextPost:
      idx >= 0 && idx < slugs.length - 1
        ? { slug: slugs[idx + 1], title: posts[idx + 1].title }
        : undefined,
  }
}
