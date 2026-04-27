import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetTransactions = vi.fn()

vi.mock('@/app/actions/transactions', () => ({
  getTransactions: (...args: unknown[]) => mockGetTransactions(...args),
}))

import { useTransactions } from '@/hooks/useTransactions'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockData = [
  { id: '1', date: '2026-01-10', description: 'Venda', total: 100, type: 'Receita' as const, category: null },
  { id: '2', date: '2026-01-12', description: 'Farinha', total: -30, type: 'Despesa' as const, category: 'Ingredientes' },
]

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockGetTransactions.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(
      () => useTransactions('2026-01-01', '2026-01-31'),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
  })

  it('retorna os dados da action corretamente', async () => {
    mockGetTransactions.mockResolvedValueOnce(mockData)
    const { result } = renderHook(
      () => useTransactions('2026-01-01', '2026-01-31'),
      { wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('passa startDate e endDate para a action', async () => {
    mockGetTransactions.mockResolvedValueOnce([])
    const { result } = renderHook(
      () => useTransactions('2026-03-01', '2026-03-31'),
      { wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetTransactions).toHaveBeenCalledWith('2026-03-01', '2026-03-31')
  })

  it('propaga erros da action', async () => {
    mockGetTransactions.mockRejectedValueOnce(new Error('Falha no servidor'))
    const { result } = renderHook(
      () => useTransactions('2026-01-01', '2026-01-31'),
      { wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
