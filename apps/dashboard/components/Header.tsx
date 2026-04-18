import { auth } from "@clerk/nextjs/server"

export async function Header({ title }: { title: string }) {
  await auth()

  return (
    <header className="h-14 flex items-center px-8 shrink-0 border-b border-[var(--c-border)] bg-[var(--c-bg)]">
      <h1 className="text-sm font-semibold tracking-tight text-[var(--c-text)] m-0">
        {title}
      </h1>
    </header>
  )
}
