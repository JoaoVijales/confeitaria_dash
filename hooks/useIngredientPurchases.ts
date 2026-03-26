import { useQuery } from '@tanstack/react-query'
import { getIngredientPurchases } from '@/app/actions/ingredient-purchases'

export function useIngredientPurchases(ingredientId?: number) {
  return useQuery({
    queryKey: ['ingredient_purchases', ingredientId],
    queryFn: () => getIngredientPurchases(ingredientId),
  })
}
