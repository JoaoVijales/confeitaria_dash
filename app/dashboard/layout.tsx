import { Sidebar } from '@/components/Sidebar'
import { MobileHeader } from '@/components/MobileHeader'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="flex flex-col min-w-0">
        <MobileHeader />
        <TooltipProvider>
          <div className="flex-1">
            {children}
          </div>
        </TooltipProvider>
      </main>
    </div>
  )
}
