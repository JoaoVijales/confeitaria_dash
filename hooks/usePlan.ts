import { useQuery } from '@tanstack/react-query'
import { getTenantPlan } from '@/app/actions/auth'

export function usePlan() {
  return useQuery({
    queryKey: ['plan'],
    queryFn: () => getTenantPlan(),
  })
}
