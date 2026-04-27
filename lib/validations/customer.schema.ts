
import * as z from 'zod'

export const customerSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Telefone inválido'),
  is_vip: z.boolean(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
