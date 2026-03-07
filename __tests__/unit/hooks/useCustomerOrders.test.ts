import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const { mockOrder, mockEq, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockOrder = vi.fn()
  const mockEq = vi.fn(() => ({ order: mockOrder }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockOrder, mockEq, mockSelect, mockFrom }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
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

  it('busca pedidos de um cliente especifico', async () => {
    mockOrder.mockResolvedValueOnce({ data: mockOrders, error: null })

    const { result } = renderHook(() => useCustomerOrders('cust-1'), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockOrders)
    expect(mockFrom).toHaveBeenCalledWith('orders')
    expect(mockEq).toHaveBeenCalledWith('customer_id', 'cust-1')
  })

  it('nao executa query quando customerId esta ausente', async () => {
    const { result } = renderHook(() => useCustomerOrders(undefined), { wrapper: createWrapper() })

    // Query deve estar desabilitada
    expect(result.current.isLoading).toBe(false)
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('trata erro do supabase', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useCustomerOrders('cust-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual({ message: 'DB error' })
  })
})
