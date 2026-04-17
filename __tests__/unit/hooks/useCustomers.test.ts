import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetCustomers = vi.hoisted(() => vi.fn())

vi.mock('@/app/actions/customers', () => ({
  getCustomers: mockGetCustomers,
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
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
    total_orders: 2,
    total_spent: 350,
    created_at: '2024-01-01T00:00:00Z',
    last_purchase: '2024-03-20T14:00:00Z',
  },
  {
    id: '2',
    name: 'Joao Santos',
    email: 'joao@test.com',
    phone: '11888888888',
    is_vip: false,
    total_orders: 0,
    total_spent: 0,
    created_at: '2024-01-01T00:00:00Z',
    last_purchase: null,
  },
]

describe('useCustomers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna lista de clientes da server action', async () => {
    mockGetCustomers.mockResolvedValueOnce(mockCustomers)

    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0].last_purchase).toBe('2024-03-20T14:00:00Z')
    expect(result.current.data![0].total_spent).toBe(350)
    expect(result.current.data![1].last_purchase).toBeNull()
  })

  it('propaga erro da server action', async () => {
    mockGetCustomers.mockRejectedValueOnce(new Error('Fetch error'))

    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('Fetch error')
  })
})
