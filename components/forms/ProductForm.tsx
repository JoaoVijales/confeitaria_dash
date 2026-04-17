'use client'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormValues } from '@/lib/validations/product.schema'
import { calculateProductCost } from '@/lib/utils/product-cost'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Plus, ChefHat, Wheat, Calculator } from 'lucide-react'
import { useMemo, useEffect, useState } from 'react'

export type IngredientOption = {
  id: number
  name: string
  unit: string
  unit_cost: number
}

export type RecipeOption = {
  id: string
  name: string
  yield_unit: string
  cost_per_yield_unit: number
}

type ProductFormProps = {
  defaultValues?: Partial<ProductFormValues> & { id?: string }
  onSubmit: (data: ProductFormValues) => void
  isSubmitting: boolean
  ingredients: IngredientOption[]
  recipes: RecipeOption[]
}

const CATEGORIES = ['Bolos', 'Tortas', 'Cupcakes', 'Doces', 'Outros']

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  ingredients,
  recipes,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      min_stock: 0,
      is_compound: false,
      extra_cost: 0,
      components: [],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'components' })

  const price = watch('price')
  const manualCost = watch('cost') ?? 0
  const components = watch('components')
  const extraCost = watch('extra_cost') ?? 0

  const hasComponents = fields.length > 0

  const recipeIndices = fields
    .map((_, i) => i)
    .filter(i => components[i]?.component_type === 'recipe')

  const ingredientIndices = fields
    .map((_, i) => i)
    .filter(i => components[i]?.component_type === 'ingredient')

  const computedCost = useMemo(() => {
    if (!hasComponents) return manualCost
    return calculateProductCost(
      components,
      recipes.map(r => ({ id: r.id, cost_per_yield_unit: r.cost_per_yield_unit })),
      ingredients.map(i => ({ id: i.id, unit_cost: i.unit_cost })),
      extraCost,
    )
  }, [hasComponents, components, recipes, ingredients, extraCost, manualCost])

  const [marginInput, setMarginInput] = useState('0.00')

  useEffect(() => {
    const m = price > 0 ? ((price - computedCost) / price) * 100 : 0
    setMarginInput(m.toFixed(2))
  }, [price, computedCost])

  function handleMarginChange(value: string) {
    setMarginInput(value)
    const m = parseFloat(value)
    if (!isNaN(m) && m >= 0 && m < 100 && computedCost > 0) {
      setValue('price', parseFloat((computedCost / (1 - m / 100)).toFixed(2)))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(data =>
        onSubmit({ ...data, is_compound: data.components.length > 0 })
      )}
      className="space-y-5"
    >
      {/* Nome + Categoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
        </div>
      </div>

      {/* Composição */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          <h3 className="text-sm font-semibold text-slate-700">Composição do Produto</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione as receitas e ingredientes que formam este produto.
          </p>
        </div>

        <div className="p-4 space-y-5">
          {/* Receitas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Receitas
                </span>
                {recipeIndices.length > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px] h-4 px-1.5 rounded-full">
                    {recipeIndices.length}
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => append({ component_type: 'recipe', quantity: 1 })}
              >
                <Plus className="h-3 w-3" /> Receita
              </Button>
            </div>

            <div className="space-y-1.5">
              {recipeIndices.length === 0 ? (
                <div className="flex items-center justify-center py-4 rounded-lg border border-dashed border-slate-200 bg-white/80">
                  <p className="text-xs text-slate-400">Nenhuma receita adicionada</p>
                </div>
              ) : (
                recipeIndices.map(index => (
                  <div
                    key={fields[index].id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-purple-100 shadow-sm"
                  >
                    <ChefHat className="h-3.5 w-3.5 text-purple-300 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <Controller
                        name={`components.${index}.recipe_id`}
                        control={control}
                        render={({ field: f }) => (
                          <Select value={f.value ?? ''} onValueChange={f.onChange}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Selecione a receita..." />
                            </SelectTrigger>
                            <SelectContent>
                              {recipes.map(r => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        className="h-8 w-16 text-sm text-center"
                        {...register(`components.${index}.quantity`, { valueAsNumber: true })}
                      />
                      <span className="text-xs text-slate-400 w-10 truncate text-right">
                        {recipes.find(r => r.id === components[index]?.recipe_id)?.yield_unit ?? 'un.'}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Ingredientes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wheat className="h-4 w-4 text-green-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Ingredientes
                </span>
                {ingredientIndices.length > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0 text-[10px] h-4 px-1.5 rounded-full">
                    {ingredientIndices.length}
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                onClick={() => append({ component_type: 'ingredient', quantity: 1 })}
              >
                <Plus className="h-3 w-3" /> Ingrediente
              </Button>
            </div>

            <div className="space-y-1.5">
              {ingredientIndices.length === 0 ? (
                <div className="flex items-center justify-center py-4 rounded-lg border border-dashed border-slate-200 bg-white/80">
                  <p className="text-xs text-slate-400">Nenhum ingrediente adicionado</p>
                </div>
              ) : (
                ingredientIndices.map(index => {
                  const ing = ingredients.find(i => i.id === components[index]?.ingredient_id)
                  return (
                    <div
                      key={fields[index].id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-green-100 shadow-sm"
                    >
                      <Wheat className="h-3.5 w-3.5 text-green-300 flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <Controller
                          name={`components.${index}.ingredient_id`}
                          control={control}
                          render={({ field: f }) => (
                            <Select
                              value={f.value ? String(f.value) : ''}
                              onValueChange={v => f.onChange(parseInt(v))}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Selecione o ingrediente..." />
                              </SelectTrigger>
                              <SelectContent>
                                {ingredients.map(i => (
                                  <SelectItem key={i.id} value={String(i.id)}>
                                    {i.name} ({i.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          className="h-8 w-16 text-sm text-center"
                          {...register(`components.${index}.quantity`, { valueAsNumber: true })}
                        />
                        <span className="text-xs text-slate-400 w-8 text-right">
                          {ing?.unit ?? '—'}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <Separator />

          {/* Custo extra + custo resultante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="extra_cost" className="text-xs text-slate-600">
                Custo extra (embalagem, etc.)
              </Label>
              <Input
                id="extra_cost"
                type="number"
                step="0.01"
                min="0"
                className="h-9"
                {...register('extra_cost', { valueAsNumber: true })}
              />
            </div>

            {hasComponents ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600 flex items-center gap-1">
                  <Calculator className="h-3 w-3" /> Custo calculado
                </Label>
                <div className="h-9 flex items-center px-3 rounded-md border border-emerald-200 bg-emerald-50">
                  <span className="text-sm font-semibold text-emerald-700">
                    R$ {computedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="cost" className="text-xs text-slate-600">
                  Custo manual (R$)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-9"
                  {...register('cost', { valueAsNumber: true })}
                />
                {errors.cost && <p className="text-red-500 text-xs">{errors.cost.message}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preço de venda + Margem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço de venda (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="margin">Margem de lucro (%)</Label>
          <Input
            id="margin"
            type="number"
            step="0.01"
            value={marginInput}
            onChange={e => handleMarginChange(e.target.value)}
          />
        </div>
      </div>

      {/* Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock">Estoque Atual</Label>
          <Input
            id="stock"
            type="number"
            step="1"
            min="0"
            {...register('stock', { valueAsNumber: true })}
          />
          {errors.stock && <p className="text-red-500 text-xs">{errors.stock.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Estoque Mínimo</Label>
          <Input
            id="min_stock"
            type="number"
            step="1"
            min="0"
            {...register('min_stock', { valueAsNumber: true })}
          />
          {errors.min_stock && <p className="text-red-500 text-xs">{errors.min_stock.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
      </Button>
    </form>
  )
}
