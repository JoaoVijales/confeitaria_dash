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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  calculateTotalRecipeCost,
  calculateCostPerPortion,
} from '@/lib/utils/recipe-cost'

const INGREDIENT_UNITS = ['g', 'ml', 'un', 'kg', 'L'] as const
const YIELD_UNITS = ['un', 'g', 'kg', 'ml', 'L'] as const

type IngredientUnit = typeof INGREDIENT_UNITS[number]

const recipeIngredientSchema = z.object({
  ingredient_id: z.string().min(1, 'Selecione um ingrediente'),
  quantity: z.number().min(0.01, 'Quantidade deve ser positiva'),
  unit: z.enum(INGREDIENT_UNITS),
})

const recipeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  yield: z.number().min(1, 'Rendimento deve ser maior que zero'),
  yield_unit: z.enum(YIELD_UNITS),
  ingredients: z.array(recipeIngredientSchema),
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
  ingredients: IngredientInRecipe | null
}

type Recipe = {
  id: string
  name: string
  yield: number
  yield_unit: string
  recipe_ingredients: RecipeIngredient[]
}

type RecipeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe: Recipe | null
  onSave: (data: RecipeFormValues) => void
}

function mapBaseUnit(unit: string): 'kg' | 'g' | 'L' | 'ml' | 'un' {
  if (unit === 'kg') return 'kg'
  if (unit === 'g') return 'g'
  if (['L', 'l', 'litro', 'litros'].includes(unit)) return 'L'
  if (unit === 'ml') return 'ml'
  return 'un'
}

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipe,
  onSave,
}: RecipeFormDialogProps) {
  const { data: ingredients } = useIngredients()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      yield: 1,
      yield_unit: 'un',
      ingredients: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  const watchedIngredients = useWatch({ control, name: 'ingredients' })
  const watchedYield = useWatch({ control, name: 'yield' })

  const costSummary = useMemo(() => {
    if (!ingredients || !watchedIngredients?.length) {
      return { totalCost: 0, costPerPortion: 0 }
    }

    const enriched = watchedIngredients
      .filter(ri => ri.ingredient_id && ri.quantity > 0)
      .map(ri => {
        const ing = ingredients.find(i => String(i.id) === String(ri.ingredient_id))
        if (!ing) return null
        return {
          quantity: ri.quantity,
          unit: ri.unit as IngredientUnit,
          unit_cost: ing.unit_cost,
          base_unit: mapBaseUnit(ing.unit),
        }
      })
      .filter(Boolean) as Array<{
        quantity: number
        unit: IngredientUnit
        unit_cost: number
        base_unit: IngredientUnit
      }>

    const totalCost = calculateTotalRecipeCost(enriched)
    const portions = watchedYield > 0 ? watchedYield : 1
    const costPerPortion = calculateCostPerPortion(totalCost, portions)

    return { totalCost, costPerPortion }
  }, [watchedIngredients, watchedYield, ingredients])

  useEffect(() => {
    if (recipe) {
      reset({
        name: recipe.name,
        yield: recipe.yield,
        yield_unit: (recipe.yield_unit as typeof YIELD_UNITS[number]) ?? 'un',
        ingredients: recipe.recipe_ingredients.map((ri: RecipeIngredient) => ({
          ingredient_id: ri.ingredients?.id ?? '',
          quantity: ri.quantity,
          unit: (ri.unit as IngredientUnit) ?? 'g',
        })),
      })
    } else {
      reset({
        name: '',
        yield: 1,
        yield_unit: 'un',
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

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Receita</Label>
            <Input id="name" placeholder="Ex: Massa de Bolo de Chocolate" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Rendimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yield">Rendimento</Label>
              <Input id="yield" type="number" min={1} step="0.01" {...register('yield', { valueAsNumber: true })} />
              {errors.yield && <p className="text-red-500 text-sm">{errors.yield.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Unidade do Rendimento</Label>
              <Controller
                name="yield_unit"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {YIELD_UNITS.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Ingredientes */}
          <div className="space-y-2">
            <Label>Ingredientes da Receita</Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_100px_60px_36px] gap-2 items-center">
                  <Controller
                    name={`ingredients.${index}.ingredient_id`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          const ing = ingredients?.find(i => String(i.id) === value)
                          if (ing) {
                            setValue(`ingredients.${index}.unit`, ing.unit as IngredientUnit)
                          }
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ingrediente" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients?.map((ing) => (
                            <SelectItem key={ing.id} value={String(ing.id)}>
                              {ing.name}
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
                      <Input
                        value={field.value || '—'}
                        readOnly
                        className="text-center text-slate-500 bg-slate-50 cursor-default"
                      />
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

          {/* Resumo de Custo */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">Custo da Receita</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-500">Custo Total</p>
                <Badge variant="outline" className="mt-1 text-slate-800 font-mono">
                  {fmt(costSummary.totalCost)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Custo por unidade de rendimento</p>
                <Badge variant="outline" className="mt-1 text-slate-800 font-mono">
                  {fmt(costSummary.costPerPortion)}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center pt-1">
              A margem de lucro é definida no produto, não na receita.
            </p>
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
