export type IngredientCostInfo = { id: number; unit_cost: number }
export type RecipeCostInfo = { id: string; cost_per_yield_unit: number }
export type ComponentInput = {
  component_type: 'recipe' | 'ingredient'
  recipe_id?: string
  ingredient_id?: number
  quantity: number
}

export function calculateProductCost(
  components: ComponentInput[],
  recipes: RecipeCostInfo[],
  ingredients: IngredientCostInfo[],
  extraCost = 0,
): number {
  const recipeMap = new Map(recipes.map(r => [r.id, r.cost_per_yield_unit]))
  const ingMap = new Map(ingredients.map(i => [i.id, i.unit_cost]))

  const componentsCost = components.reduce((total, comp) => {
    if (comp.component_type === 'recipe' && comp.recipe_id) {
      return total + (recipeMap.get(comp.recipe_id) ?? 0) * comp.quantity
    }
    if (comp.component_type === 'ingredient' && comp.ingredient_id) {
      return total + (ingMap.get(comp.ingredient_id) ?? 0) * comp.quantity
    }
    return total
  }, 0)

  return componentsCost + extraCost
}
