export type IngredientData = {
  id: string
  name: string
  unit: string
  current_stock: number
  min_stock: number
}

export type RecipeData = {
  id: string
  recipe_ingredients: Array<{
    ingredient_id: string
    quantity: number
  }>
}

export type ProductData = {
  id: string
  name: string
  stock: number
  min_stock: number
}

export type IngredientAlert = IngredientData & {
  threshold: number
  source: 'recipe' | 'min_stock'
}

export type ProductAlert = ProductData

// Soma as quantidades de um ingrediente em todas as receitas (já em unidade base)
export function calculateIngredientMinFromRecipes(
  ingredientId: string,
  recipes: RecipeData[]
): number {
  return recipes.reduce((total, recipe) => {
    return (
      total +
      recipe.recipe_ingredients
        .filter((ri) => ri.ingredient_id === ingredientId)
        .reduce((sum, ri) => sum + ri.quantity, 0)
    )
  }, 0)
}

// Retorna o threshold efetivo: recipe-based se usado em receitas, senão min_stock
export function getIngredientThreshold(
  ingredient: IngredientData,
  recipes: RecipeData[]
): { threshold: number; source: 'recipe' | 'min_stock' } {
  const recipeMin = calculateIngredientMinFromRecipes(ingredient.id, recipes)
  if (recipeMin > 0) {
    return { threshold: recipeMin, source: 'recipe' }
  }
  return { threshold: ingredient.min_stock, source: 'min_stock' }
}

// Ingredientes com estoque abaixo do threshold efetivo
export function getLowStockIngredients(
  ingredients: IngredientData[],
  recipes: RecipeData[]
): IngredientAlert[] {
  return ingredients
    .map((ing) => {
      const { threshold, source } = getIngredientThreshold(ing, recipes)
      return { ...ing, threshold, source }
    })
    .filter((ing) => ing.current_stock < ing.threshold)
}

// Produtos com estoque abaixo do min_stock
export function getLowStockProducts(products: ProductData[]): ProductAlert[] {
  return products.filter((p) => p.stock < p.min_stock)
}
