import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ReceitasPage from '@/app/dashboard/receitas/page.tsx'
import { useRecipes } from '@/hooks/useRecipes'

// Mock do hook useRecipes
vi.mock('@/hooks/useRecipes', () => ({
  useRecipes: vi.fn(),
}))

// Mock de components que podem dar problema no render unitário
vi.mock('@/components/RecipeFormDialog', () => ({
  RecipeFormDialog: () => <div data-testid="recipe-form-dialog" />,
}))

describe('ReceitasPage', () => {
  it('deve exibir os nomes dos ingredientes na tabela', () => {
    const mockRecipes = [
      {
        id: '1',
        yield: 10,
        products: [{ name: 'Bolo de Cenoura', price: 50, cost: 20 }],
        recipe_ingredients: [
          {
            quantity: 500,
            unit: 'g',
            ingredients: [{ name: 'Cenoura', unit: 'kg', unit_cost: 5 }]
          },
          {
            quantity: 3,
            unit: 'un',
            ingredients: [{ name: 'Ovos', unit: 'un', unit_cost: 0.5 }]
          }
        ]
      }
    ]

    ;(useRecipes as any).mockReturnValue({
      data: mockRecipes,
      isLoading: false,
      error: null,
    })

    render(<ReceitasPage />)

    // Verifica se os nomes dos ingredientes aparecem
    expect(screen.getByText('Cenoura')).toBeInTheDocument()
    expect(screen.getByText('Ovos')).toBeInTheDocument()
  })
})
