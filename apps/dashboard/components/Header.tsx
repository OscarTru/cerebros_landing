import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

export async function Header({ title }: { title: string }) {
  const { userId } = await auth()

  return (
    <header className="h-14 border-b border-[var(--c-border)] bg-[var(--c-bg)] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold text-[var(--c-text)]">{title}</h1>
      <div className="flex items-center gap-3">
        {userId && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        )}
      </div>
    </header>
  )
}
