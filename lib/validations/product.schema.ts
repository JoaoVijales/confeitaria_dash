
import * as z from 'zod'

export const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  category: z.string().min(3, 'Categoria é obrigatória'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  cost: z.number().min(0, 'Custo deve ser positivo'),
  stock: z.number().min(0, 'Estoque não pode ser negativo'),
  min_stock: z.number().min(0, 'Estoque mínimo não pode ser negativo'),
})

export type ProductFormValues = z.infer<typeof productSchema>
