import { FadeIn } from "@/components/FadeIn"
import { founders } from "@/content/site"

export function Founders() {
  return (
    <section
      id="nosotros"
      className="relative py-32 px-6 border-t border-white/[0.06] z-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn className="mb-20 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Quiénes somos
          </p>
          <h2
            className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            Dos residentes, <span className="italic text-zinc-400">una conversación.</span>
          </h2>
        </FadeIn>

        {/* Founder blocks */}
        <div className="flex flex-col gap-24">
          {founders.map((f, i) => {
            const reverse = i % 2 === 1
            return (
              <FadeIn
                key={f.id}
                delay={0.1}
                className={`grid md:grid-cols-12 gap-10 md:gap-16 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="md:col-span-5">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-[#111113] border border-white/[0.08]">
                    <img
                      src={f.photo}
                      alt={f.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                </div>
                <div className="md:col-span-7">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4">
                    {f.orderLabel}
                  </p>
                  <h3
                    className="font-serif text-white mb-3"
                    style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                  >
                    {f.name}
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-8">
                    {f.role}
                  </p>
                  <p
                    className="text-zinc-400 leading-[1.75] text-base"
                    style={{ maxWidth: "55ch" }}
                  >
                    {f.bio}
                  </p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
