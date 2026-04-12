import type { ReactNode } from "react"
import { slugify } from "@/lib/readingTime"

// MDX heading components that inject slugified IDs for TOC anchor links
function H2({ children }: { children?: ReactNode }) {
  const text = typeof children === "string" ? children : ""
  return <h2 id={slugify(text)}>{children}</h2>
}

function H3({ children }: { children?: ReactNode }) {
  const text = typeof children === "string" ? children : ""
  return <h3 id={slugify(text)}>{children}</h3>
}

export const headingComponents = { h2: H2, h3: H3 }
