import { Sidebar } from "@/components/Sidebar"
import { PageTransition } from "@/components/ui/PageTransition"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--c-bg)]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
