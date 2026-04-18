import { auth } from "@clerk/nextjs/server"

export async function Header({ title }: { title: string }) {
  await auth()

  return (
    <header
      className="h-16 flex items-center px-8 shrink-0"
      style={{
        borderBottom: "1px solid var(--c-border)",
        background: "var(--c-bg)",
      }}
    >
      <h1
        className="text-base font-semibold"
        style={{ color: "var(--c-text)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h1>
    </header>
  )
}
