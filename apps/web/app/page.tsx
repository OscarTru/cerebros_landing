import { getAllPosts } from "@/content/blog-utils"
import { HomePageClient } from "@/components/HomePageClient"

export default async function HomePage() {
  const allPosts = await getAllPosts()
  const latestPosts = allPosts.slice(0, 2)
  return <HomePageClient latestPosts={latestPosts} />
}
