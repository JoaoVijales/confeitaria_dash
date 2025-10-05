import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          yield,
          products (id, name, price, cost),
          recipe_ingredients (
            quantity,
            ingredients (id, name, unit, unit_cost)
          )
        `)
      if (error) {
        throw error
      }
      return data
    },
  })
}
