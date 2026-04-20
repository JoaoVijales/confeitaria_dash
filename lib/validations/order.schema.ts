import * as z from 'zod'

export const ORDER_STATUSES = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Finalizado', 'Cancelado'] as const
export type OrderStatus = typeof ORDER_STATUSES[number]
export const orderStatusSchema = z.enum(ORDER_STATUSES)

const orderItemSchema = z.object({
  product_id: z.string(),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  unit_price: z.number(),
})

export const orderSchema = z.object({
  customer_id: z.string().uuid('Cliente inválido'),
  items: z.array(orderItemSchema).min(1, 'Pedido deve ter pelo menos um item'),
  total: z.number().min(0, 'Total deve ser positivo'),
  status: orderStatusSchema,
})

export type OrderFormValues = z.infer<typeof orderSchema>
