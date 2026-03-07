import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { calculateTotalRecipeCost, calculateCostPerPortion } from '@/lib/utils/recipe-cost'

type RecipeIngredientInput = {
  ingredient_id: string
  quantity: number
  unit: 'g' | 'ml' | 'un'
}

export function useRecipeCost(recipeIngredients: RecipeIngredientInput[], portions: number) {
  const supabase = createClient()
  const ingredientIds = recipeIngredients.map(ri => ri.ingredient_id)
  const enabled = ingredientIds.length > 0 && portions > 0

  const query = useQuery({
    queryKey: ['recipe_cost', recipeIngredients, portions],
    enabled,
    queryFn: async () => {
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('*')
        .in('id', ingredientIds)

      if (error) throw error

      const enriched = recipeIngredients
        .map(ri => {
          const ingredient = ingredients.find((i: { id: string }) => i.id === ri.ingredient_id)
          if (!ingredient) return null
          return {
            quantity: ri.quantity,
            unit: ri.unit,
            unit_cost: ingredient.unit_cost,
            base_unit: ingredient.unit as 'kg' | 'L' | 'un',
          }
        })
        .filter(Boolean) as Array<{ quantity: number; unit: 'g' | 'ml' | 'un'; unit_cost: number; base_unit: 'kg' | 'L' | 'un' }>

      const totalCost = calculateTotalRecipeCost(enriched)
      const costPerPortion = calculateCostPerPortion(totalCost, portions)

      return { totalCost, costPerPortion }
    },
  })

  // Expose totalCost and costPerPortion at the top level for convenience
  // When disabled (empty ingredients), return 0; when error, return undefined
  const totalCost = enabled ? query.data?.totalCost : 0
  const costPerPortion = enabled ? query.data?.costPerPortion : 0

  return {
    ...query,
    totalCost,
    costPerPortion,
  }
}
