import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useIngredientPurchases(ingredientId?: number) {
  return useQuery({
    queryKey: ['ingredient_purchases', ingredientId],
    queryFn: async () => {
      const query = supabase
        .from('ingredient_purchases')
        .select('*, ingredients(name, unit)')

      if (ingredientId !== undefined) {
        const { data, error } = await query
          .eq('ingredient_id', ingredientId)
          .order('purchased_at', { ascending: false })
        if (error) throw error
        return data
      }

      const { data, error } = await query.order('purchased_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
