import { Sidebar } from '@/components/Sidebar'
import { MobileHeader } from '@/components/MobileHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="flex flex-col">
        <MobileHeader />
        <div className="flex-1">
            {children}
        </div>
      </main>
    </div>
  )
}
