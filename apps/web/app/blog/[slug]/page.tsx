import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAllSlugs, getPostBySlug } from "@/content/blog-utils"
import { BlogLayout } from "@/layouts/BlogLayout"
import { EbookCTA } from "@/components/EbookCTA"

// ISR: revalida cada 60s si nadie llama a /api/revalidate antes.
export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return notFound()

  // Posts escritos desde el dashboard se guardan como HTML (TipTap).
  // Posts legacy migrados desde MDX siguen en markdown puro.
  // Detectamos el formato por presencia de tags HTML comunes.
  const isHtml = /<(p|h[1-6]|ul|ol|div|blockquote|pre|img|hr)[\s>]/i.test(post.content)

  return (
    <BlogLayout
      title={post.title}
      date={post.date}
      author={post.author}
      description={post.description}
      slug={post.slug}
      image={post.image}
    >
      {isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : (
        <MDXRemote source={post.content} components={{ EbookCTA }} />
      )}
    </BlogLayout>
  )
}
