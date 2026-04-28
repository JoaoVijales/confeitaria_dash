import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getTenantPlan } from '@/app/actions/billing'
import { getPlanLimits, type Plan } from '@/lib/utils/plan-limits'

export type PlanQueryData = {
  plan: Plan
  tenantName: string
  limits: ReturnType<typeof getPlanLimits>
}

export function usePlan(options?: Omit<UseQueryOptions<PlanQueryData>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['plan'],
    queryFn: async () => {
      const { plan, name } = await getTenantPlan()
      return {
        plan,
        tenantName: name,
        limits: getPlanLimits(plan),
      }
    },
    ...options,
  })
}
