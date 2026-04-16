import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "@/app/globals.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Cerebros Esponjosos" },
  description: "Panel de administración de Cerebros Esponjosos",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
