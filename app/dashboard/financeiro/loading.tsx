import { Skeleton } from '@/components/ui/skeleton'

export default function FinanceiroLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
