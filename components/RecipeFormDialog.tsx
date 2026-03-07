'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm, useFieldArray, SubmitHandler, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useMemo } from 'react'
import { useIngredients } from '@/hooks/useIngredients'
import { useProducts } from '@/hooks/useProducts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  calculateTotalRecipeCost,
  calculateCostPerPortion,
  calculatePriceWithMargin,
} from '@/lib/utils/recipe-cost'

const RECIPE_UNITS = ['g', 'ml', 'un'] as const
type RecipeUnit = typeof RECIPE_UNITS[number]

const recipeIngredientSchema = z.object({
  ingredient_id: z.string().min(1, 'Selecione um ingrediente'),
  quantity: z.number().min(0.01, 'Quantidade deve ser positiva'),
  unit: z.enum(['g', 'ml', 'un']),
})

const recipeSchema = z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  yield: z.number().min(1, 'Rendimento deve ser maior que zero'),
  ingredients: z.array(recipeIngredientSchema),
  margin_type: z.enum(['percent', 'fixed']),
  margin_value: z.number().min(0, 'Margem deve ser positiva'),
})

export type RecipeFormValues = z.infer<typeof recipeSchema>

type IngredientInRecipe = {
  id: string
  unit_cost: number
  unit: string
}

type RecipeIngredient = {
  quantity: number
  unit?: string
  ingredients: IngredientInRecipe[] | null
}

type ProductInRecipe = {
  id: string
  name: string
  price: number
  cost: number
}

type Recipe = {
  id: string
  yield: number
  products: ProductInRecipe[] | null
  recipe_ingredients: RecipeIngredient[]
}

type RecipeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe: Recipe | null
  onSave: (data: RecipeFormValues) => void
}

function mapBaseUnit(unit: string): 'kg' | 'L' | 'un' {
  if (unit === 'kg') return 'kg'
  if (['L', 'l', 'litro', 'litros'].includes(unit)) return 'L'
  return 'un'
}

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipe,
  onSave,
}: RecipeFormDialogProps) {
  const { data: products } = useProducts()
  const { data: ingredients } = useIngredients()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [],
      margin_type: 'percent',
      margin_value: 30,
      yield: 1,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  const watchedIngredients = useWatch({ control, name: 'ingredients' })
  const watchedYield = useWatch({ control, name: 'yield' })
  const watchedMarginType = useWatch({ control, name: 'margin_type' })
  const watchedMarginValue = useWatch({ control, name: 'margin_value' })

  const costSummary = useMemo(() => {
    if (!ingredients || !watchedIngredients?.length) {
      return { totalCost: 0, costPerPortion: 0, suggestedPrice: 0 }
    }

    const enriched = watchedIngredients
      .filter(ri => ri.ingredient_id && ri.quantity > 0)
      .map(ri => {
        const ing = ingredients.find(i => String(i.id) === String(ri.ingredient_id))
        if (!ing) return null
        return {
          quantity: ri.quantity,
          unit: ri.unit as RecipeUnit,
          unit_cost: ing.unit_cost,
          base_unit: mapBaseUnit(ing.unit),
        }
      })
      .filter(Boolean) as Array<{ quantity: number; unit: RecipeUnit; unit_cost: number; base_unit: 'kg' | 'L' | 'un' }>

    const totalCost = calculateTotalRecipeCost(enriched)
    const portions = watchedYield > 0 ? watchedYield : 1
    const costPerPortion = calculateCostPerPortion(totalCost, portions)
    const marginValue = watchedMarginValue ?? 0
    const suggestedPrice = calculatePriceWithMargin(costPerPortion, marginValue, watchedMarginType ?? 'percent')

    return { totalCost, costPerPortion, suggestedPrice }
  }, [watchedIngredients, watchedYield, watchedMarginType, watchedMarginValue, ingredients])

  useEffect(() => {
    if (recipe) {
      reset({
        product_id: recipe.products?.[0]?.id ?? '',
        yield: recipe.yield,
        margin_type: 'percent',
        margin_value: 30,
        ingredients: recipe.recipe_ingredients.map((ri: RecipeIngredient) => ({
          ingredient_id: ri.ingredients?.[0]?.id ?? '',
          quantity: ri.quantity,
          unit: (ri.unit as RecipeUnit) ?? 'g',
        })),
      })
    } else {
      reset({
        product_id: '',
        yield: 1,
        margin_type: 'percent',
        margin_value: 30,
        ingredients: [],
      })
    }
  }, [recipe, reset])

  const onSubmit: SubmitHandler<RecipeFormValues> = (data) => {
    onSave(data)
    onOpenChange(false)
  }

  const fmt = (v: number) =>
    isFinite(v)
      ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? 'Editar Receita' : 'Adicionar Receita'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Produto + Rendimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.product_id && <p className="text-red-500 text-sm">{errors.product_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="yield">Rendimento (porções)</Label>
              <Input id="yield" type="number" min={1} {...register('yield', { valueAsNumber: true })} />
              {errors.yield && <p className="text-red-500 text-sm">{errors.yield.message}</p>}
            </div>
          </div>

          <Separator />

          {/* Ingredientes */}
          <div className="space-y-2">
            <Label>Ingredientes da Receita</Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_100px_80px_36px] gap-2 items-center">
                  <Controller
                    name={`ingredients.${index}.ingredient_id`}
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ingrediente" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients?.map((ing) => (
                            <SelectItem key={ing.id} value={String(ing.id)}>
                              {ing.name} ({ing.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Qtd."
                    {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <Controller
                    name={`ingredients.${index}.unit`}
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Un." />
                        </SelectTrigger>
                        <SelectContent>
                          {RECIPE_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => append({ ingredient_id: '', quantity: 0, unit: 'g' })}
            >
              + Adicionar Ingrediente
            </Button>
          </div>

          <Separator />

          {/* Margem de Lucro */}
          <div className="space-y-2">
            <Label>Margem de Lucro</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Tipo</Label>
                <Controller
                  name="margin_type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">
                  {watchedMarginType === 'percent' ? 'Margem (%)' : 'Valor (R$)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('margin_value', { valueAsNumber: true })}
                />
                {errors.margin_value && <p className="text-red-500 text-xs">{errors.margin_value.message}</p>}
              </div>
            </div>
          </div>

          {/* Resumo de Custo (dinâmico) */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">Resumo de Custo</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-500">Custo Total</p>
                <Badge variant="outline" className="mt-1 text-slate-800 font-mono">
                  {fmt(costSummary.totalCost)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Custo/Porção</p>
                <Badge variant="outline" className="mt-1 text-slate-800 font-mono">
                  {fmt(costSummary.costPerPortion)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Preço Sugerido</p>
                <Badge className="mt-1 bg-purple-100 text-purple-800 font-mono">
                  {fmt(costSummary.suggestedPrice)}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
