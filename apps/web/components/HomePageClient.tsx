"use client"
import { Nav } from "@/components/Nav"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Hero } from "@/sections/Hero"
import { Manifesto } from "@/sections/Manifesto"
import { Founders } from "@/sections/Founders"
import { Content } from "@/sections/Content"
import { Ebook } from "@/sections/Ebook"
import { Newsletter } from "@/sections/Newsletter"
import { Footer } from "@/sections/Footer"
import type { PostMeta } from "@cerebros/lib"

export function HomePageClient({ latestPosts }: { latestPosts: PostMeta[] }) {
  return (
    <div className="relative min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] overflow-x-hidden font-sans">
      <NoiseOverlay />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Manifesto />
        <Founders />
        <Content latestPosts={latestPosts} />
        <Ebook />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
