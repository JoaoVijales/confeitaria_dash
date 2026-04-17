import { useQuery } from '@tanstack/react-query'
import { getTenantPlan } from '@/app/actions/billing'
import { getPlanLimits } from '@/lib/utils/plan-limits'

export function usePlan() {
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
  })
}
