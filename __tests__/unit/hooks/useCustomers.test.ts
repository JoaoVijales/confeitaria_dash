import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const { mockSelect, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockSelect, mockFrom }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

import { useCustomers } from '@/hooks/useCustomers'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockCustomers = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@test.com',
    phone: '11999999999',
    is_vip: true,
    birthday: '1990-05-15',
    segment: 'Premium',
    orders: [
      { created_at: '2024-01-15T10:00:00Z', total: 150 },
      { created_at: '2024-03-20T14:00:00Z', total: 200 },
    ],
  },
  {
    id: '2',
    name: 'Joao Santos',
    email: 'joao@test.com',
    phone: '11888888888',
    is_vip: false,
    birthday: '1985-10-20',
    segment: 'Regular',
    orders: [],
  },
]

describe('useCustomers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch customers and compute derived fields', async () => {
    mockSelect.mockResolvedValueOnce({ data: mockCustomers, error: null })

    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)

    const maria = result.current.data![0]
    expect(maria.last_purchase).toBe('2024-03-20T14:00:00Z')
    expect(maria.total_spent).toBe(350)
    expect(maria.total_orders).toBe(2)

    const joao = result.current.data![1]
    expect(joao.last_purchase).toBeNull()
    expect(joao.total_spent).toBe(0)
    expect(joao.total_orders).toBe(0)
  })

  it('should handle error from supabase', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'Fetch error' } })

    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual({ message: 'Fetch error' })
  })
})
