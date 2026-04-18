import { auth } from "@clerk/nextjs/server"

export async function Header({ title }: { title: string }) {
  await auth()

  return (
    <header style={{
      height: "56px",
      display: "flex",
      alignItems: "center",
      padding: "0 32px",
      flexShrink: 0,
      borderBottom: "1px solid var(--c-border)",
      background: "var(--c-bg)",
    }}>
      <h1 style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "var(--c-text)",
        letterSpacing: "-0.01em",
        margin: 0,
      }}>
        {title}
      </h1>
    </header>
  )
}
