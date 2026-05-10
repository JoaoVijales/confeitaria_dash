import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import ReceitasPage from '@/app/dashboard/receitas/page'
import { useRecipes } from '@/hooks/useRecipes'

vi.mock('@/hooks/useRecipes', () => ({
  useRecipes: vi.fn(),
}))

vi.mock('@/app/actions/recipes', () => ({
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}))

vi.mock('@/components/RecipeFormDialog', () => ({
  RecipeFormDialog: () => <div data-testid="recipe-form-dialog" />,
}))

const mockRecipes = [
  {
    id: '1',
    name: 'Massa de Bolo de Cenoura',
    yield: 10,
    yield_unit: 'un',
    recipe_ingredients: [
      {
        quantity: 500,
        unit: 'g',
        ingredients: { id: 'ing-1', name: 'Cenoura', unit: 'kg', unit_cost: 5 },
      },
      {
        quantity: 3,
        unit: 'un',
        ingredients: { id: 'ing-2', name: 'Ovos', unit: 'un', unit_cost: 0.5 },
      },
    ],
  },
]

describe('ReceitasPage', () => {
  it('exibe o nome da receita na tabela', () => {
    ;(useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockRecipes,
      isLoading: false,
      error: null,
    })

    render(<TooltipProvider><ReceitasPage /></TooltipProvider>)

    expect(screen.getByText('Massa de Bolo de Cenoura')).toBeInTheDocument()
  })

  it('exibe os nomes dos ingredientes na tabela', () => {
    ;(useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockRecipes,
      isLoading: false,
      error: null,
    })

    render(<TooltipProvider><ReceitasPage /></TooltipProvider>)

    expect(screen.getByText('Cenoura')).toBeInTheDocument()
    expect(screen.getByText('Ovos')).toBeInTheDocument()
  })

  it('exibe rendimento com unidade', () => {
    ;(useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockRecipes,
      isLoading: false,
      error: null,
    })

    render(<TooltipProvider><ReceitasPage /></TooltipProvider>)

    expect(screen.getByText('10 un')).toBeInTheDocument()
  })

  it('exibe estado de carregamento', () => {
    ;(useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<TooltipProvider><ReceitasPage /></TooltipProvider>)

    expect(screen.queryByText('Massa de Bolo de Cenoura')).not.toBeInTheDocument()
  })
})
