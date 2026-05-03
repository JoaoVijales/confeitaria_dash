type IngredientUnit = 'g' | 'kg' | 'ml' | 'L' | 'un'

// Converts recipe quantity to ingredient's stored unit.
// Units should always match (recipe unit = ingredient unit), but g→kg and ml→L
// conversions are kept for backward compatibility with existing data.
export function convertToBaseUnit(
  quantity: number,
  fromUnit: IngredientUnit,
  toUnit: IngredientUnit
): number {
  if (fromUnit === toUnit) return quantity
  if (fromUnit === 'g' && toUnit === 'kg') return quantity / 1000
  if (fromUnit === 'ml' && toUnit === 'L') return quantity / 1000
  return NaN
}

// Cost of one ingredient in a recipe
export function calculateIngredientCost(
  quantity: number,
  recipeUnit: IngredientUnit,
  unitCost: number,
  baseUnit: IngredientUnit
): number {
  const convertedQuantity = convertToBaseUnit(quantity, recipeUnit, baseUnit)
  return convertedQuantity * unitCost
}

// Sum of all ingredient costs
export function calculateTotalRecipeCost(
  ingredients: Array<{
    quantity: number
    unit: IngredientUnit
    unit_cost: number
    base_unit: IngredientUnit
  }>
): number {
  return ingredients.reduce((total, ingredient) => {
    return total + calculateIngredientCost(
      ingredient.quantity,
      ingredient.unit,
      ingredient.unit_cost,
      ingredient.base_unit
    )
  }, 0)
}

// Cost divided by number of portions
export function calculateCostPerPortion(totalCost: number, portions: number): number {
  if (portions <= 0) throw new Error('Portions must be greater than zero')
  return totalCost / portions
}

// Calculate sale price from cost + margin
// percent: price = cost / (1 - margin/100)
// fixed: price = cost + margin
export function calculatePriceWithMargin(
  cost: number,
  margin: number,
  type: 'percent' | 'fixed'
): number {
  if (type === 'fixed') {
    return cost + margin
  }
  // percent
  if (margin >= 100) throw new Error('Percent margin must be less than 100')
  const result = cost / (1 - margin / 100)
  return Math.round(result * 100) / 100
}

// Calculate margin % from cost and sale price
// Returns 0 if salePrice = 0
export function calculateMarginPercent(cost: number, salePrice: number): number {
  if (salePrice === 0) return 0
  const result = (salePrice - cost) / salePrice * 100
  return Math.round(result * 100) / 100
}
