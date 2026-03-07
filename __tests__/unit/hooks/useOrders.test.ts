import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetOrders = vi.fn()

vi.mock('@/app/actions/orders', () => ({
  getOrders: (...args: any[]) => mockGetOrders(...args),
}))

import { useOrders } from '@/hooks/useOrders'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockOrdersData = [
  { id: '1', customer_name: 'Maria', total: 150, status: 'Pendente', created_at: '2024-01-15' },
  { id: '2', customer_name: 'Joao', total: 200, status: 'Entregue', created_at: '2024-01-20' },
]

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch orders successfully', async () => {
    mockGetOrders.mockResolvedValueOnce(mockOrdersData)

    const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockOrdersData)
    expect(mockGetOrders).toHaveBeenCalled()
  })

  it('should handle error from getOrders', async () => {
    mockGetOrders.mockRejectedValueOnce(new Error('Server error'))

    const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeInstanceOf(Error)
  })
})
