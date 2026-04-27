import * as z from 'zod'

export const expenseSchema = z.object({
  date: z.string().date('Data inválida — use o formato YYYY-MM-DD'),
  description: z.string().trim().min(1, 'Descrição é obrigatória'),
  category: z.string().trim().min(1, 'Categoria é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser positiva'),
  unit_price: z.number().min(0, 'Valor unitário deve ser positivo').max(10_000_000, 'Valor unitário muito alto'),
  total: z.number().min(0, 'Total deve ser positivo').max(10_000_000, 'Total muito alto'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>