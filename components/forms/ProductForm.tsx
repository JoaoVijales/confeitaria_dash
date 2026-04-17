'use client'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormValues } from '@/lib/validations/product.schema'
import { calculateProductCost } from '@/lib/utils/product-cost'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Plus } from 'lucide-react'
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

  const isCompound = watch('is_compound')
  const price = watch('price')
  const manualCost = watch('cost') ?? 0
  const components = watch('components')
  const extraCost = watch('extra_cost') ?? 0

  const computedCost = useMemo(() => {
    if (!isCompound) return manualCost
    return calculateProductCost(
      components,
      recipes.map(r => ({ id: r.id, cost_per_yield_unit: r.cost_per_yield_unit })),
      ingredients.map(i => ({ id: i.id, unit_cost: i.unit_cost })),
      extraCost,
    )
  }, [isCompound, components, recipes, ingredients, extraCost, manualCost])

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

      <div className="flex items-center gap-2">
        <Controller
          name="is_compound"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="is_compound"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="is_compound" className="cursor-pointer font-normal">
          Produto composto (montado a partir de receitas e/ou ingredientes)
        </Label>
      </div>

      {isCompound && (
        <div className="space-y-3 rounded-lg border border-slate-200 p-4 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">Composição</p>

          {fields.length === 0 && (
            <p className="text-xs text-slate-400">Nenhum componente. Clique em &quot;Adicionar&quot; para montar o produto.</p>
          )}

          {fields.map((field, index) => {
            const type = watch(`components.${index}.component_type`)
            return (
              <div key={field.id} className="grid grid-cols-[120px_1fr_90px_32px] gap-2 items-end">
                <div>
                  {index === 0 && <p className="text-xs text-slate-500 mb-1">Tipo</p>}
                  <Controller
                    name={`components.${index}.component_type`}
                    control={control}
                    render={({ field: f }) => (
                      <Select
                        value={f.value}
                        onValueChange={v => {
                          f.onChange(v)
                          setValue(`components.${index}.recipe_id`, undefined)
                          setValue(`components.${index}.ingredient_id`, undefined)
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recipe">Receita</SelectItem>
                          <SelectItem value="ingredient">Ingrediente</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  {index === 0 && <p className="text-xs text-slate-500 mb-1">Item</p>}
                  {type === 'recipe' ? (
                    <Controller
                      name={`components.${index}.recipe_id`}
                      control={control}
                      render={({ field: f }) => (
                        <Select value={f.value ?? ''} onValueChange={f.onChange}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Selecione a receita..." />
                          </SelectTrigger>
                          <SelectContent>
                            {recipes.map(r => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name} ({r.yield_unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <Controller
                      name={`components.${index}.ingredient_id`}
                      control={control}
                      render={({ field: f }) => (
                        <Select
                          value={f.value ? String(f.value) : ''}
                          onValueChange={v => f.onChange(parseInt(v))}
                        >
                          <SelectTrigger className="h-9 text-sm">
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
                  )}
                </div>

                <div>
                  {index === 0 && <p className="text-xs text-slate-500 mb-1">Qtd</p>}
                  <Input
                    type="number"
                    step="0.001"
                    className="h-9 text-sm"
                    {...register(`components.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-8 text-red-400 hover:text-red-600 self-end"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ component_type: 'ingredient', quantity: 1 })}
            className="mt-1 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar componente
          </Button>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div className="space-y-1">
              <Label htmlFor="extra_cost" className="text-xs text-slate-600">Custo extra (embalagem, etc.)</Label>
              <Input
                id="extra_cost"
                type="number"
                step="0.01"
                className="h-9"
                {...register('extra_cost', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Custo calculado</Label>
              <Input
                value={`R$ ${computedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                readOnly
                className="h-9 bg-white text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {!isCompound && (
        <div className="space-y-2">
          <Label htmlFor="cost">Custo (R$)</Label>
          <Input id="cost" type="number" step="0.01" {...register('cost', { valueAsNumber: true })} />
          {errors.cost && <p className="text-red-500 text-xs">{errors.cost.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço de venda (R$)</Label>
          <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock">Estoque Atual</Label>
          <Input id="stock" type="number" step="1" {...register('stock', { valueAsNumber: true })} />
          {errors.stock && <p className="text-red-500 text-xs">{errors.stock.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Estoque Mínimo</Label>
          <Input id="min_stock" type="number" step="1" {...register('min_stock', { valueAsNumber: true })} />
          {errors.min_stock && <p className="text-red-500 text-xs">{errors.min_stock.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
