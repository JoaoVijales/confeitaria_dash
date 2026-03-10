import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getPlanLimits, Plan } from '@/lib/utils/plan-limits'

const supabase = createClient()

export function usePlan() {
  return useQuery({
    queryKey: ['plan'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tenants')
        .select('plan, name')
        .single()

      const plan = ((data?.plan as Plan) ?? 'free') as Plan
      return {
        plan,
        tenantName: (data?.name as string) ?? '',
        limits: getPlanLimits(plan),
      }
    },
  })
}
