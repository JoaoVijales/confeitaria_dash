import * as z from 'zod'

export const recipeCostSchema = z.object({
  margin_type: z.enum(['percent', 'fixed']),
  margin_value: z.number().min(0, 'Margem deve ser positiva'),
  portions: z.number().int().positive('Rendimento deve ser positivo'),
}).refine(
  (data) => data.margin_type !== 'percent' || data.margin_value < 100,
  { message: 'Margem percentual deve ser menor que 100%', path: ['margin_value'] }
)

export type RecipeCostFormValues = z.infer<typeof recipeCostSchema>
