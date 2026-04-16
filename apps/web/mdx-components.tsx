import type { MDXComponents } from "mdx/types"

// Required by @next/mdx for App Router. Provides default HTML element mappings
// and allows MDX files to receive custom components via the `components` prop.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components }
}
