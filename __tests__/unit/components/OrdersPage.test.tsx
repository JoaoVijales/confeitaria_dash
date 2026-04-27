import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import OrdersPage from '@/app/dashboard/pedidos/page'
import { useOrders } from '@/hooks/useOrders'

vi.mock('@/hooks/useOrders', () => ({
  useOrders: vi.fn(),
}))

vi.mock('@/hooks/useMutations', () => ({
  useCreateOrder: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateOrderStatus: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteOrder: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock('@/app/actions/orders', () => ({
  createOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
  deleteOrder: vi.fn(),
}))

vi.mock('@/components/dialogs/OrderFormDialog', () => ({
  OrderFormDialog: () => <div data-testid="order-form-dialog" />,
}))

vi.mock('@/components/dialogs/ConfirmDialog', () => ({
  ConfirmDialog: () => <div data-testid="confirm-dialog" />,
}))

vi.mock('@/components/dialogs/UpdateOrderStatusDialog', () => ({
  UpdateOrderStatusDialog: () => <div data-testid="update-status-dialog" />,
}))

const mockOrders = [
  {
    id: 'order-1',
    total: 150,
    status: 'Pendente',
    created_at: '2026-01-10T10:00:00Z',
    customers: [{ name: 'Maria Silva' }],
  },
  {
    id: 'order-2',
    total: 80,
    status: 'Finalizado',
    created_at: '2026-01-12T14:00:00Z',
    customers: [{ name: 'João Santos' }],
  },
]

describe('OrdersPage', () => {
  it('exibe pedidos na tabela', () => {
    ;(useOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    })

    render(<TooltipProvider><OrdersPage /></TooltipProvider>)

    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('João Santos')).toBeInTheDocument()
  })

  it('exibe EmptyState quando nao ha pedidos', () => {
    ;(useOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<TooltipProvider><OrdersPage /></TooltipProvider>)

    expect(screen.getByText(/nenhum pedido/i)).toBeInTheDocument()
  })

  it('exibe skeleton durante carregamento', () => {
    ;(useOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<TooltipProvider><OrdersPage /></TooltipProvider>)

    const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('filtra pedidos pelo campo de busca', () => {
    ;(useOrders as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    })

    render(<TooltipProvider><OrdersPage /></TooltipProvider>)

    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })
})
