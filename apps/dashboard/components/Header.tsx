import { auth } from "@clerk/nextjs/server"

export async function Header({ title }: { title: string }) {
  await auth()

  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{
        borderBottom: "1px solid var(--c-border)",
        background: "var(--c-bg)",
      }}
    >
      <h1
        className="text-sm font-semibold"
        style={{ color: "var(--c-text)", letterSpacing: "-0.01em" }}
      >
        {title}
      </h1>
    </header>
  )
}
