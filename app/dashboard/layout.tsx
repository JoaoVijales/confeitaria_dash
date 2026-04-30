import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { checkOnboarding } from '@/app/actions/auth'
import { getTenantPlan } from '@/app/actions/billing'
import { Sidebar } from '@/components/Sidebar'
import { MobileHeader } from '@/components/MobileHeader'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hasOnboarded = await checkOnboarding()
  if (!hasOnboarded) {
    redirect('/onboarding')
  }

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  if (pathname !== '/dashboard/billing') {
    const { plan, status } = await getTenantPlan()
    if (plan === 'free' || status !== 'active') {
      redirect('/dashboard/billing?blocked=true')
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="flex flex-col min-w-0">
        <MobileHeader />
        <TooltipProvider>
          <ErrorBoundary>
            <div className="flex-1">
              {children}
            </div>
          </ErrorBoundary>
        </TooltipProvider>
      </main>
    </div>
  )
}
