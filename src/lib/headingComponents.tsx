import type { ReactNode } from "react"
import { slugify } from "@/lib/readingTime"

type HeadingProps = { children?: ReactNode }

// MDX heading overrides that inject slugified IDs for TOC anchor links.
// Defined as arrow functions assigned to lowercase keys so react-refresh
// does not treat this file as a component-only module.
export const headingComponents: Record<string, (p: HeadingProps) => JSX.Element> = {
  h2: ({ children }: HeadingProps) => {
    const text = typeof children === "string" ? children : ""
    return <h2 id={slugify(text)}>{children}</h2>
  },
  h3: ({ children }: HeadingProps) => {
    const text = typeof children === "string" ? children : ""
    return <h3 id={slugify(text)}>{children}</h3>
  },
}
