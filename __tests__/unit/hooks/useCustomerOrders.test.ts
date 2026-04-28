import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetCustomerOrders = vi.hoisted(() => vi.fn())
vi.mock('@/app/actions/customers', () => ({
  getCustomerOrders: mockGetCustomerOrders,
}))

import { useCustomerOrders } from '@/hooks/useCustomerOrders'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockOrders = [
  {
    id: 'order-1',
    total: 150,
    status: 'Finalizado',
    created_at: '2026-03-01',
    order_items: [{ product_id: 'p-1', quantity: 2, products: { name: 'Bolo' } }],
  },
  {
    id: 'order-2',
    total: 80,
    status: 'Pendente',
    created_at: '2026-03-05',
    order_items: [],
  },
]

describe('useCustomerOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca pedidos de um cliente específico', async () => {
    mockGetCustomerOrders.mockResolvedValueOnce(mockOrders)
    const { result } = renderHook(() => useCustomerOrders('cust-1'), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockOrders)
    expect(mockGetCustomerOrders).toHaveBeenCalledWith('cust-1')
  })

  it('não executa query quando customerId está ausente', () => {
    const { result } = renderHook(() => useCustomerOrders(undefined), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockGetCustomerOrders).not.toHaveBeenCalled()
  })

  it('propaga erro da server action', async () => {
    mockGetCustomerOrders.mockRejectedValueOnce(new Error('DB error'))
    const { result } = renderHook(() => useCustomerOrders('cust-1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
