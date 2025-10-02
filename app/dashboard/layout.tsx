import { Sidebar } from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <main className="flex flex-col">
        {/* We can add a header here later */}
        <div className="flex-1 p-4 sm:px-6 sm:py-0">
            {children}
        </div>
      </main>
    </div>
  )
}
