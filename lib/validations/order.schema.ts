import * as z from 'zod'
import { ORDER_STATUSES } from '@/lib/constants/order-status'

export { ORDER_STATUSES } from '@/lib/constants/order-status'
export type { OrderStatus } from '@/lib/constants/order-status'

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
