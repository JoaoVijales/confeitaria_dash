import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockCreateRevenue = vi.fn()
const mockUpdateRevenue = vi.fn()
const mockDeleteRevenue = vi.fn()
const mockCreateExpense = vi.fn()
const mockUpdateExpense = vi.fn()
const mockDeleteExpense = vi.fn()
const mockCreateCustomer = vi.fn()
const mockUpdateCustomer = vi.fn()
const mockDeleteCustomer = vi.fn()
const mockCreateProduct = vi.fn()
const mockUpdateProduct = vi.fn()
const mockDeleteProduct = vi.fn()
const mockCreateOrder = vi.fn()
const mockUpdateOrderStatus = vi.fn()
const mockDeleteOrder = vi.fn()

vi.mock('@/app/actions/revenues', () => ({
  createRevenue: (...args: unknown[]) => mockCreateRevenue(...args),
  updateRevenue: (...args: unknown[]) => mockUpdateRevenue(...args),
  deleteRevenue: (...args: unknown[]) => mockDeleteRevenue(...args),
}))

vi.mock('@/app/actions/expenses', () => ({
  createExpense: (...args: unknown[]) => mockCreateExpense(...args),
  updateExpense: (...args: unknown[]) => mockUpdateExpense(...args),
  deleteExpense: (...args: unknown[]) => mockDeleteExpense(...args),
}))

vi.mock('@/app/actions/customers', () => ({
  createCustomer: (...args: unknown[]) => mockCreateCustomer(...args),
  updateCustomer: (...args: unknown[]) => mockUpdateCustomer(...args),
  deleteCustomer: (...args: unknown[]) => mockDeleteCustomer(...args),
}))

vi.mock('@/app/actions/products', () => ({
  createProduct: (...args: unknown[]) => mockCreateProduct(...args),
  updateProduct: (...args: unknown[]) => mockUpdateProduct(...args),
  deleteProduct: (...args: unknown[]) => mockDeleteProduct(...args),
}))

vi.mock('@/app/actions/orders', () => ({
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
  updateOrderStatus: (...args: unknown[]) => mockUpdateOrderStatus(...args),
  deleteOrder: (...args: unknown[]) => mockDeleteOrder(...args),
}))

vi.mock('@/lib/validations/order.schema', () => ({
  OrderFormValues: {},
}))

import {
  useCreateRevenue,
  useUpdateRevenue,
  useDeleteRevenue,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateOrder,
  useUpdateOrderStatus,
  useDeleteOrder,
} from '@/hooks/useMutations'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function createWrapper() {
  const queryClient = createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

describe('useMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Revenue Mutations', () => {
    it('useCreateRevenue should call createRevenue and invalidate queries', async () => {
      mockCreateRevenue.mockResolvedValueOnce({ id: '1' })
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: ReactNode }) =>
        QueryClientProvider({ client: queryClient, children })

      const { result } = renderHook(() => useCreateRevenue(), { wrapper })

      expect(result.current.mutate).toBeDefined()

      await act(async () => {
        result.current.mutate(new FormData())
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockCreateRevenue).toHaveBeenCalled()
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['revenues'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['financials'] })
    })

    it('useDeleteRevenue should call deleteRevenue', async () => {
      mockDeleteRevenue.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useDeleteRevenue(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate('rev-1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDeleteRevenue).toHaveBeenCalledWith('rev-1')
    })
  })

  describe('Expense Mutations', () => {
    it('useCreateExpense should call createExpense', async () => {
      mockCreateExpense.mockResolvedValueOnce({ id: '1' })

      const { result } = renderHook(() => useCreateExpense(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate(new FormData())
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockCreateExpense).toHaveBeenCalled()
    })

    it('useDeleteExpense should call deleteExpense', async () => {
      mockDeleteExpense.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useDeleteExpense(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate('exp-1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDeleteExpense).toHaveBeenCalledWith('exp-1')
    })
  })

  describe('Customer Mutations', () => {
    it('useCreateCustomer should call createCustomer', async () => {
      mockCreateCustomer.mockResolvedValueOnce({ id: '1' })

      const { result } = renderHook(() => useCreateCustomer(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate(new FormData())
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockCreateCustomer).toHaveBeenCalled()
    })

    it('useDeleteCustomer should call deleteCustomer', async () => {
      mockDeleteCustomer.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useDeleteCustomer(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate('cust-1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDeleteCustomer).toHaveBeenCalledWith('cust-1')
    })
  })

  describe('Product Mutations', () => {
    it('useCreateProduct should call createProduct', async () => {
      mockCreateProduct.mockResolvedValueOnce({ id: '1' })

      const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate(new FormData())
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockCreateProduct).toHaveBeenCalled()
    })

    it('useDeleteProduct should call deleteProduct', async () => {
      mockDeleteProduct.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate('prod-1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDeleteProduct).toHaveBeenCalledWith('prod-1')
    })
  })

  describe('Order Mutations', () => {
    it('useCreateOrder should call createOrder', async () => {
      mockCreateOrder.mockResolvedValueOnce({ id: '1' })

      const { result } = renderHook(() => useCreateOrder(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate({ customer_id: 'c1', items: [] } as Parameters<typeof result.current.mutate>[0])
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockCreateOrder).toHaveBeenCalled()
    })

    it('useUpdateOrderStatus should call updateOrderStatus', async () => {
      mockUpdateOrderStatus.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate({ id: 'ord-1', status: 'Entregue' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith('ord-1', 'Entregue')
    })

    it('useDeleteOrder should call deleteOrder', async () => {
      mockDeleteOrder.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useDeleteOrder(), { wrapper: createWrapper() })

      await act(async () => {
        result.current.mutate('ord-1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDeleteOrder).toHaveBeenCalledWith('ord-1')
    })
  })
})
