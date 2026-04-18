// Converts recipe quantity (g/ml/un) to ingredient's base unit (kg/L/un)
export function convertToBaseUnit(
  quantity: number,
  fromUnit: 'g' | 'ml' | 'un',
  toUnit: 'kg' | 'L' | 'un'
): number {
  if (fromUnit === 'g' && toUnit === 'kg') return quantity / 1000
  if (fromUnit === 'ml' && toUnit === 'L') return quantity / 1000
  if (fromUnit === 'un' && toUnit === 'un') return quantity
  return NaN
}

// Cost of one ingredient in a recipe
export function calculateIngredientCost(
  quantity: number,
  recipeUnit: 'g' | 'ml' | 'un',
  unitCost: number,
  baseUnit: 'kg' | 'L' | 'un'
): number {
  const convertedQuantity = convertToBaseUnit(quantity, recipeUnit, baseUnit)
  return convertedQuantity * unitCost
}

// Sum of all ingredient costs
export function calculateTotalRecipeCost(
  ingredients: Array<{
    quantity: number
    unit: 'g' | 'ml' | 'un'
    unit_cost: number
    base_unit: 'kg' | 'L' | 'un'
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
