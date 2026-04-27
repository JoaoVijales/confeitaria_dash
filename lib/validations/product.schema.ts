import * as z from 'zod'

export const productComponentSchema = z.object({
  component_type: z.enum(['recipe', 'ingredient']),
  recipe_id: z.string().uuid().optional(),
  ingredient_id: z.number().int().positive().optional(),
  quantity: z.number().positive('Quantidade deve ser positiva'),
})

export const productSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  category: z.string().trim().min(3, 'Categoria é obrigatória'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  cost: z.number().min(0, 'Custo deve ser positivo'),
  stock: z.number().min(0, 'Estoque não pode ser negativo'),
  min_stock: z.number().min(0, 'Estoque mínimo não pode ser negativo'),
  is_compound: z.boolean(),
  extra_cost: z.number().min(0),
  components: z.array(productComponentSchema),
})

export type ProductFormValues = z.infer<typeof productSchema>
export type ProductComponentValue = z.infer<typeof productComponentSchema>
