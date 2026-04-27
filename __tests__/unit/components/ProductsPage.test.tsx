import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import ProductsPage from '@/app/dashboard/produtos/page'
import { useProducts } from '@/hooks/useProducts'
// Mock do hook useProducts
vi.mock('@/hooks/useProducts', () => ({
  useProducts: vi.fn(),
}))

// Mock das mutations
vi.mock('@/hooks/useMutations', () => ({
  useCreateProduct: vi.fn(() => ({ mutate: vi.fn() })),
  useUpdateProduct: vi.fn(() => ({ mutate: vi.fn() })),
  useDeleteProduct: vi.fn(() => ({ mutate: vi.fn() })),
}))

// Mock de components que podem dar problema no render unitário
vi.mock('@/components/dialogs/ProductFormDialog', () => ({
  ProductFormDialog: () => <div data-testid="product-form-dialog" />,
}))
vi.mock('@/components/dialogs/ConfirmDialog', () => ({
  ConfirmDialog: () => <div data-testid="confirm-dialog" />,
}))

describe('ProductsPage', () => {
  it('deve exibir o botão Ver Receita para cada produto', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Bolo de Chocolate',
        price: 40,
        cost: 15,
        stock: 10,
        min_stock: 5,
        category: 'Bolos'
      }
    ]

    ;(useProducts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    })

    render(<TooltipProvider><ProductsPage /></TooltipProvider>)

    // O botão deve ter o ícone ChefHat ou ser identificável
    // Como ainda não implementamos, este teste deve falhar ao procurar pelo botão/link específico
    const recipeButton = screen.getByRole('link', { name: /ver receita/i })
    expect(recipeButton).toBeInTheDocument()
    expect(recipeButton).toHaveAttribute('href', '/dashboard/receitas?product_id=1')
  })
})
