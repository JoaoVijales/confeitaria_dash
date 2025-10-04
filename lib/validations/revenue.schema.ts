import * as z from 'zod'

export const revenueSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser positiva'),
  unit_price: z.number().min(0, 'Valor unitário deve ser positivo'),
  total: z.number().min(0, 'Total deve ser positivo'),
})

export type RevenueFormValues = z.infer<typeof revenueSchema>
