import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          customers (
            name,
            email
          ),
          order_items (
            quantity,
            products (
              price,
              recipes (
                yield,
                recipe_ingredients (
                  quantity,
                  ingredients (unit_cost)
                )
              )
            )
          )
        `)
      if (error) {
        throw error
      }
      return data
    },
  })
}
