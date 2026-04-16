"use client"

import { EbookCTA } from "@/components/EbookCTA"

interface BlogArticleClientProps {
  Article: React.ComponentType<{ components?: Record<string, React.ComponentType> }>
}

export function BlogArticleClient({ Article }: BlogArticleClientProps) {
  return <Article components={{ EbookCTA }} />
}
