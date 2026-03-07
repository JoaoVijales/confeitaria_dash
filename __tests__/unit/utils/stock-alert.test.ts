import { describe, it, expect } from 'vitest'
import {
  calculateIngredientMinFromRecipes,
  getIngredientThreshold,
  getLowStockIngredients,
  getLowStockProducts,
} from '@/lib/utils/stock-alert'

const ing1 = { id: 'i1', name: 'Farinha', unit: 'kg', current_stock: 0.3, min_stock: 0.5 }
const ing2 = { id: 'i2', name: 'Manteiga', unit: 'kg', current_stock: 1.0, min_stock: 0.2 }
const ing3 = { id: 'i3', name: 'Açúcar', unit: 'kg', current_stock: 0.1, min_stock: 0.4 }

const recipes = [
  {
    id: 'r1',
    recipe_ingredients: [
      { ingredient_id: 'i1', quantity: 0.5 },
      { ingredient_id: 'i2', quantity: 0.2 },
    ],
  },
  {
    id: 'r2',
    recipe_ingredients: [{ ingredient_id: 'i1', quantity: 0.3 }],
  },
]

describe('calculateIngredientMinFromRecipes', () => {
  it('soma as quantidades de todas as receitas que usam o ingrediente', () => {
    expect(calculateIngredientMinFromRecipes('i1', recipes)).toBeCloseTo(0.8)
  })

  it('considera apenas o ingrediente correto', () => {
    expect(calculateIngredientMinFromRecipes('i2', recipes)).toBeCloseTo(0.2)
  })

  it('retorna 0 para ingrediente não usado em nenhuma receita', () => {
    expect(calculateIngredientMinFromRecipes('i3', recipes)).toBe(0)
  })

  it('retorna 0 para lista de receitas vazia', () => {
    expect(calculateIngredientMinFromRecipes('i1', [])).toBe(0)
  })

  it('retorna 0 para receita sem ingredientes', () => {
    expect(calculateIngredientMinFromRecipes('i1', [{ id: 'r1', recipe_ingredients: [] }])).toBe(0)
  })
})

describe('getIngredientThreshold', () => {
  it('usa mínimo de receitas quando ingrediente está em pelo menos uma receita', () => {
    const result = getIngredientThreshold(ing1, recipes)
    expect(result.threshold).toBeCloseTo(0.8)
    expect(result.source).toBe('recipe')
  })

  it('usa min_stock quando ingrediente não está em nenhuma receita', () => {
    const result = getIngredientThreshold(ing3, recipes)
    expect(result.threshold).toBe(0.4)
    expect(result.source).toBe('min_stock')
  })

  it('usa min_stock quando não há receitas', () => {
    const result = getIngredientThreshold(ing1, [])
    expect(result.threshold).toBe(0.5)
    expect(result.source).toBe('min_stock')
  })
})

describe('getLowStockIngredients', () => {
  it('retorna ingredientes abaixo do threshold de receita e do min_stock', () => {
    // ing1: current=0.3, threshold=0.8 (recipe) → ALERTA
    // ing2: current=1.0, threshold=0.2 (recipe) → OK
    // ing3: current=0.1, threshold=0.4 (min_stock) → ALERTA
    const result = getLowStockIngredients([ing1, ing2, ing3], recipes)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.id)).toContain('i1')
    expect(result.map((r) => r.id)).toContain('i3')
  })

  it('inclui threshold e source no resultado', () => {
    const result = getLowStockIngredients([ing1], recipes)
    expect(result[0].threshold).toBeCloseTo(0.8)
    expect(result[0].source).toBe('recipe')
  })

  it('retorna lista vazia quando todos os ingredientes estão ok', () => {
    const ok = { ...ing1, current_stock: 2.0 }
    expect(getLowStockIngredients([ok], recipes)).toHaveLength(0)
  })

  it('retorna lista vazia para ingredientes vazios', () => {
    expect(getLowStockIngredients([], recipes)).toHaveLength(0)
  })

  it('não alerta ingrediente com min_stock zero e sem receitas', () => {
    const semLimite = { ...ing3, min_stock: 0, current_stock: 0 }
    // current(0) < threshold(0) é falso → sem alerta
    expect(getLowStockIngredients([semLimite], [])).toHaveLength(0)
  })
})

describe('getLowStockProducts', () => {
  const products = [
    { id: 'p1', name: 'Bolo', stock: 2, min_stock: 5 },
    { id: 'p2', name: 'Torta', stock: 10, min_stock: 3 },
    { id: 'p3', name: 'Cupcake', stock: 0, min_stock: 10 },
  ]

  it('retorna apenas produtos abaixo do min_stock', () => {
    const result = getLowStockProducts(products)
    expect(result).toHaveLength(2)
    expect(result.map((p) => p.id)).toContain('p1')
    expect(result.map((p) => p.id)).toContain('p3')
  })

  it('retorna lista vazia quando todos os produtos estão ok', () => {
    const ok = [{ id: 'p1', name: 'Bolo', stock: 10, min_stock: 5 }]
    expect(getLowStockProducts(ok)).toHaveLength(0)
  })

  it('retorna lista vazia para produtos vazios', () => {
    expect(getLowStockProducts([])).toHaveLength(0)
  })

  it('alerta produto com estoque exatamente zero', () => {
    const zerado = [{ id: 'p1', name: 'Bolo', stock: 0, min_stock: 1 }]
    expect(getLowStockProducts(zerado)).toHaveLength(1)
  })
})
