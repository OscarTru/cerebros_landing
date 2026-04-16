import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllSlugs, getPostBySlug } from "@/content/blog-utils"
import { BlogLayout } from "@/layouts/BlogLayout"
import { EbookCTA } from "@/components/EbookCTA"

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
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
  const post = getPostBySlug(slug)
  if (!post) return notFound()

  const { default: Article } = await import(`@/content/blog/${slug}.mdx`)

  return (
    <BlogLayout
      title={post.title}
      date={post.date}
      author={post.author}
      description={post.description}
      slug={post.slug}
      image={post.image}
    >
      <Article components={{ EbookCTA }} />
    </BlogLayout>
  )
}
