import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeScript } from "@/components/ThemeScript"

export const metadata: Metadata = {
  metadataBase: new URL("https://cerebrosesponjosos.com"),
  title: { default: "Cerebros Esponjosos", template: "%s | Cerebros Esponjosos" },
  description: "Neurociencia en palabras claras. Educación en neurología para todos.",
  openGraph: {
    siteName: "Cerebros Esponjosos",
    locale: "es_MX",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap" />
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
