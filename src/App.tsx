import { LazyMotion, domAnimation } from "framer-motion"
import { Nav } from "@/components/Nav"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Hero } from "@/sections/Hero"
import { Manifesto } from "@/sections/Manifesto"
import { Founders } from "@/sections/Founders"
import { Content } from "@/sections/Content"
import { Ebook } from "@/sections/Ebook"
import { Newsletter } from "@/sections/Newsletter"
import { Footer } from "@/sections/Footer"

export default function App() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] overflow-x-hidden font-sans">
        <NoiseOverlay />
        <Nav />
        <main className="relative z-10">
          <Hero />
          <Manifesto />
          <Founders />
          <Content />
          <Ebook />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}
