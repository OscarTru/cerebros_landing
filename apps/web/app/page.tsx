import { getAllPosts } from "@/content/blog-utils"
import { HomePageClient } from "@/components/HomePageClient"

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 2)
  return <HomePageClient latestPosts={latestPosts} />
}
