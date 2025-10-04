import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRevenue, updateRevenue, deleteRevenue } from '@/app/actions/revenues'
import { createExpense, updateExpense, deleteExpense } from '@/app/actions/expenses'
import { RevenueFormValues } from '@/lib/validations/revenue.schema'
import { ExpenseFormValues } from '@/lib/validations/expense.schema'

export function useCreateRevenue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RevenueFormValues) => createRevenue(data as any), // formData
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] })
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateRevenue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RevenueFormValues }) => updateRevenue(id, data as any), // formData
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] })
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteRevenue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRevenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] })
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ExpenseFormValues) => createExpense(data as any), // formData
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseFormValues }) => updateExpense(id, data as any), // formData
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
