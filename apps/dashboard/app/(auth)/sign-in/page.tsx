import { SignIn } from "@clerk/nextjs"

export const dynamic = "force-dynamic"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)]">
      <SignIn
        appearance={{
          elements: {
            card: "bg-[var(--c-surface)] border border-[var(--c-border)] shadow-none rounded-2xl",
            headerTitle: "text-[var(--c-text)] font-semibold",
            headerSubtitle: "text-[var(--c-text-muted)]",
            formButtonPrimary: "bg-[var(--c-invert)] text-[var(--c-invert-fg)] hover:opacity-90",
            footerAction: "hidden",
          },
        }}
      />
    </div>
  )
}
