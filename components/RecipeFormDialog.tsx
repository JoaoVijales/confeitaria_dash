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
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useIngredients } from '@/hooks/useIngredients'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const recipeIngredientSchema = z.object({
  ingredient_id: z.number(),
  quantity: z.number().min(0, 'Quantidade deve ser positiva'),
})

const recipeSchema = z.object({
  product_id: z.number(),
  yield: z.number().min(1, 'Rendimento deve ser maior que zero'),
  ingredients: z.array(recipeIngredientSchema),
})

type RecipeFormValues = z.infer<typeof recipeSchema>

type RecipeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe: any | null // Adjust type later
  onSave: (data: RecipeFormValues) => void
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
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  useEffect(() => {
    if (recipe) {
      reset({
        product_id: recipe.products.id,
        yield: recipe.yield,
        ingredients: recipe.recipe_ingredients.map((ri: any) => ({
          ingredient_id: ri.ingredients.id,
          quantity: ri.quantity,
        })),
      })
    } else {
      reset({
        product_id: undefined,
        yield: 1,
        ingredients: [],
      })
    }
  }, [recipe, reset])

  const onSubmit: SubmitHandler<RecipeFormValues> = (data) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {recipe ? 'Editar Receita' : 'Adicionar Receita'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
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
              <Label htmlFor="yield">Rendimento</Label>
              <Input id="yield" type="number" {...register('yield', { valueAsNumber: true })} />
              {errors.yield && <p className="text-red-500 text-sm">{errors.yield.message}</p>}
            </div>
          </div>

          <div>
            <Label>Ingredientes</Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    name={`ingredients.${index}.ingredient_id`}
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ingrediente" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients?.map((ingredient) => (
                            <SelectItem key={ingredient.id} value={String(ingredient.id)}>
                              {ingredient.name} ({ingredient.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Quantidade"
                    {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    X
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ ingredient_id: 0, quantity: 0 })}
            >
              Adicionar Ingrediente
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
