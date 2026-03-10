import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetRevenues = vi.fn()

vi.mock('@/app/actions/revenues', () => ({
  getRevenues: (...args: unknown[]) => mockGetRevenues(...args),
}))

import { useRevenues } from '@/hooks/useRevenues'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockRevenuesData = [
  { id: '1', description: 'Venda 1', total: 300, date: '2024-01-01' },
  { id: '2', description: 'Venda 2', total: 500, date: '2024-01-05' },
  { id: '3', description: 'Venda 3', total: 200, date: '2024-01-10' },
]

describe('useRevenues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch revenues with pagination and total amount', async () => {
    mockGetRevenues.mockResolvedValueOnce(mockRevenuesData)

    const { result } = renderHook(() => useRevenues(1, 2), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data!.entries).toHaveLength(2)
    expect(result.current.data!.totalAmount).toBe(1000)
    expect(result.current.data!.totalPages).toBe(2)
  })

  it('should paginate correctly for page 2', async () => {
    mockGetRevenues.mockResolvedValueOnce(mockRevenuesData)

    const { result } = renderHook(() => useRevenues(2, 2), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data!.entries).toHaveLength(1)
    expect(result.current.data!.entries[0].id).toBe('3')
  })

  it('should handle error from getRevenues', async () => {
    mockGetRevenues.mockRejectedValueOnce(new Error('Failed'))

    const { result } = renderHook(() => useRevenues(1, 10), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
