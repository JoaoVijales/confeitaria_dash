import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetExpenses = vi.fn()

vi.mock('@/app/actions/expenses', () => ({
  getExpenses: (...args: unknown[]) => mockGetExpenses(...args),
}))

import { useExpenses } from '@/hooks/useExpenses'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockExpensesData = [
  { id: '1', description: 'Aluguel', category: 'Fixo', total: 2000, date: '2024-01-01' },
  { id: '2', description: 'Ingredientes', category: 'Variavel', total: 500, date: '2024-01-05' },
  { id: '3', description: 'Agua', category: 'Fixo', total: 100, date: '2024-01-10' },
]

describe('useExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch expenses with pagination and category grouping', async () => {
    mockGetExpenses.mockResolvedValueOnce(mockExpensesData)

    const { result } = renderHook(() => useExpenses(1, 2), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data!.entries).toHaveLength(2)
    expect(result.current.data!.entries[0].id).toBe('1')
    expect(result.current.data!.entries[1].id).toBe('2')
    expect(result.current.data!.totalPages).toBe(2)
    expect(result.current.data!.expensesByCategory).toEqual({ Fixo: 2100, Variavel: 500 })
  })

  it('should paginate correctly for page 2', async () => {
    mockGetExpenses.mockResolvedValueOnce(mockExpensesData)

    const { result } = renderHook(() => useExpenses(2, 2), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data!.entries).toHaveLength(1)
    expect(result.current.data!.entries[0].id).toBe('3')
  })

  it('should handle error from getExpenses', async () => {
    mockGetExpenses.mockRejectedValueOnce(new Error('Failed'))

    const { result } = renderHook(() => useExpenses(1, 10), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
