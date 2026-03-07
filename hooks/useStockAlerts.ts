import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getLowStockIngredients, getLowStockProducts } from '@/lib/utils/stock-alert'

export function useStockAlerts() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['stock_alerts'],
    queryFn: async () => {
      const [ingResult, prodResult, recResult] = await Promise.all([
        supabase.from('ingredients').select('id, name, unit, current_stock, min_stock'),
        supabase.from('products').select('id, name, stock, min_stock'),
        supabase
          .from('recipes')
          .select('id, recipe_ingredients(ingredient_id, quantity)'),
      ])

      if (ingResult.error) throw ingResult.error
      if (prodResult.error) throw prodResult.error
      if (recResult.error) throw recResult.error

      const lowIngredients = getLowStockIngredients(
        ingResult.data ?? [],
        recResult.data ?? []
      )
      const lowProducts = getLowStockProducts(prodResult.data ?? [])

      return {
        lowIngredients,
        lowProducts,
        total: lowIngredients.length + lowProducts.length,
      }
    },
  })
}
