import * as z from 'zod'

export const ingredientPurchaseSchema = z.object({
  ingredient_id: z.number().int().positive('Ingrediente é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unit_cost: z.number().min(0, 'Custo unitário deve ser positivo'),
  total_cost: z.number().min(0, 'Custo total deve ser positivo'),
  supplier: z.string().trim().optional(),
  purchased_at: z.string().date('Data inválida — use o formato YYYY-MM-DD'),
  notes: z.string().trim().optional(),
})

export type IngredientPurchaseFormValues = z.infer<typeof ingredientPurchaseSchema>
