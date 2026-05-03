import { describe, it, expect } from 'vitest'
import {
  convertToBaseUnit,
  calculateIngredientCost,
  calculateTotalRecipeCost,
  calculateCostPerPortion,
  calculatePriceWithMargin,
  calculateMarginPercent,
} from '@/lib/utils/recipe-cost'

describe('convertToBaseUnit', () => {
  it('converte gramas para quilogramas', () => {
    expect(convertToBaseUnit(250, 'g', 'kg')).toBe(0.25)
  })

  it('converte 1000g para 1kg', () => {
    expect(convertToBaseUnit(1000, 'g', 'kg')).toBe(1)
  })

  it('converte mililitros para litros', () => {
    expect(convertToBaseUnit(500, 'ml', 'L')).toBe(0.5)
  })

  it('converte unidades para unidades sem alteracao', () => {
    expect(convertToBaseUnit(3, 'un', 'un')).toBe(3)
  })

  it('converte gramas para gramas sem alteracao', () => {
    expect(convertToBaseUnit(500, 'g', 'g')).toBe(500)
  })

  it('converte mililitros para mililitros sem alteracao', () => {
    expect(convertToBaseUnit(250, 'ml', 'ml')).toBe(250)
  })

  it('retorna NaN ou lanca erro para unidades incompativeis (g para L)', () => {
    const result = convertToBaseUnit(250, 'g', 'L')
    expect(isNaN(result) || result === undefined).toBe(true)
  })

  it('retorna NaN ou lanca erro para unidades incompativeis (ml para kg)', () => {
    const result = convertToBaseUnit(100, 'ml', 'kg')
    expect(isNaN(result) || result === undefined).toBe(true)
  })
})

describe('calculateIngredientCost', () => {
  it('calcula custo de farinha: 250g com unit_cost de R$5.50/kg', () => {
    // 250 / 1000 * 5.50 = 1.375
    expect(calculateIngredientCost(250, 'g', 5.5, 'kg')).toBeCloseTo(1.375, 5)
  })

  it('calcula custo de oleo: 100ml com unit_cost de R$8.00/L', () => {
    // 100 / 1000 * 8.00 = 0.80
    expect(calculateIngredientCost(100, 'ml', 8.0, 'L')).toBeCloseTo(0.8, 5)
  })

  it('calcula custo de ovos: 2 unidades com unit_cost de R$0.75/un', () => {
    // 2 * 0.75 = 1.50
    expect(calculateIngredientCost(2, 'un', 0.75, 'un')).toBeCloseTo(1.5, 5)
  })

  it('calcula custo de ingrediente em g com unit_cost por g', () => {
    // 300g * R$0.01/g = R$3.00
    expect(calculateIngredientCost(300, 'g', 0.01, 'g')).toBeCloseTo(3.0, 5)
  })

  it('calcula custo de ingrediente em ml com unit_cost por ml', () => {
    // 200ml * R$0.008/ml = R$1.60
    expect(calculateIngredientCost(200, 'ml', 0.008, 'ml')).toBeCloseTo(1.6, 5)
  })
})

describe('calculateTotalRecipeCost', () => {
  it('soma os custos de todos os ingredientes', () => {
    const ingredients = [
      { quantity: 250, unit: 'g' as const, unit_cost: 5.5, base_unit: 'kg' as const },
      { quantity: 100, unit: 'ml' as const, unit_cost: 8.0, base_unit: 'L' as const },
      { quantity: 2, unit: 'un' as const, unit_cost: 0.75, base_unit: 'un' as const },
    ]
    // 1.375 + 0.80 + 1.50 = 3.675
    expect(calculateTotalRecipeCost(ingredients)).toBeCloseTo(3.675, 5)
  })

  it('retorna zero para lista vazia de ingredientes', () => {
    expect(calculateTotalRecipeCost([])).toBe(0)
  })

  it('calcula corretamente com um unico ingrediente', () => {
    const ingredients = [
      { quantity: 500, unit: 'g' as const, unit_cost: 10.0, base_unit: 'kg' as const },
    ]
    // 500 / 1000 * 10.0 = 5.0
    expect(calculateTotalRecipeCost(ingredients)).toBeCloseTo(5.0, 5)
  })
})

describe('calculateCostPerPortion', () => {
  it('divide o custo total pelo numero de porcoes', () => {
    // 10.00 / 5 = 2.00
    expect(calculateCostPerPortion(10.0, 5)).toBe(2.0)
  })

  it('lanca erro quando porcoes e zero', () => {
    expect(() => calculateCostPerPortion(10.0, 0)).toThrow()
  })

  it('lanca erro quando porcoes e negativo', () => {
    expect(() => calculateCostPerPortion(10.0, -1)).toThrow()
  })

  it('calcula fracao corretamente', () => {
    // 7.50 / 3 = 2.50
    expect(calculateCostPerPortion(7.5, 3)).toBeCloseTo(2.5, 5)
  })
})

describe('calculatePriceWithMargin', () => {
  it('calcula preco com margem percentual: custo=10, margem=30%', () => {
    // 10 / (1 - 0.30) = 14.285... arredondado para 14.29
    expect(calculatePriceWithMargin(10, 30, 'percent')).toBeCloseTo(14.29, 2)
  })

  it('calcula preco com margem fixa: custo=10, margem=5.00', () => {
    // 10 + 5.00 = 15.00
    expect(calculatePriceWithMargin(10, 5.0, 'fixed')).toBe(15.0)
  })

  it('retorna custo inalterado quando margem percentual e zero', () => {
    expect(calculatePriceWithMargin(10, 0, 'percent')).toBe(10)
  })

  it('retorna custo inalterado quando margem fixa e zero', () => {
    expect(calculatePriceWithMargin(10, 0, 'fixed')).toBe(10)
  })

  it('calcula margem percentual alta: custo=20, margem=50%', () => {
    // 20 / (1 - 0.50) = 40.00
    expect(calculatePriceWithMargin(20, 50, 'percent')).toBeCloseTo(40.0, 2)
  })

  it('lanca erro quando margem percentual e igual a 100', () => {
    expect(() => calculatePriceWithMargin(10, 100, 'percent')).toThrow()
  })

  it('lanca erro quando margem percentual e maior que 100', () => {
    expect(() => calculatePriceWithMargin(10, 150, 'percent')).toThrow()
  })
})

describe('calculateMarginPercent', () => {
  it('calcula percentual de margem: custo=10, preco=14.29', () => {
    // (14.29 - 10) / 14.29 * 100 ≈ 30%
    expect(calculateMarginPercent(10, 14.29)).toBeCloseTo(30, 0)
  })

  it('retorna 0 quando preco de venda e zero', () => {
    expect(calculateMarginPercent(10, 0)).toBe(0)
  })

  it('retorna 0 quando custo e preco sao iguais (margem zero)', () => {
    expect(calculateMarginPercent(10, 10)).toBeCloseTo(0, 5)
  })

  it('calcula margem de 50%: custo=20, preco=40', () => {
    // (40 - 20) / 40 * 100 = 50
    expect(calculateMarginPercent(20, 40)).toBeCloseTo(50, 5)
  })
})
