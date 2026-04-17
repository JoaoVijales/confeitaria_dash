'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductForm, IngredientOption, RecipeOption } from '@/components/forms/ProductForm'
import { ProductFormValues } from '@/lib/validations/product.schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getProductComponents } from '@/app/actions/products'
import { useIngredients } from '@/hooks/useIngredients'
import { useRecipes } from '@/hooks/useRecipes'

type ProductForDialog = {
  id: string
  name: string
  price: number
  cost: number
  stock: number
  min_stock: number
  category: string
  is_compound: boolean
  extra_cost: number
}

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductForDialog
  onSubmit: (data: ProductFormValues) => void
  isSubmitting: boolean
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isSubmitting,
}: ProductFormDialogProps) {
  const { data: rawIngredients = [] } = useIngredients()
  const { data: rawRecipes = [] } = useRecipes()

  const { data: existingComponents = [], isLoading: isLoadingComponents } = useQuery({
    queryKey: ['product-components', product?.id],
    queryFn: () => getProductComponents(product!.id),
    enabled: open && !!product?.id && !!product?.is_compound,
  })

  const ingredients: IngredientOption[] = rawIngredients.map(i => ({
    id: i.id as number,
    name: i.name as string,
    unit: i.unit as string,
    unit_cost: i.unit_cost as number,
  }))

  const recipes: RecipeOption[] = rawRecipes.map(r => ({
    id: r.id as string,
    name: (Array.isArray(r.products) ? r.products[0]?.name : (r.products as { name?: string } | null)?.name) ?? 'Receita',
    yield_unit: r.yield_unit as string,
    cost_per_yield_unit: r.cost_per_yield_unit as number,
  }))

  const title = product ? 'Editar Produto' : 'Adicionar Produto'
  const description = product ? 'Atualize os detalhes do produto.' : 'Preencha os detalhes do novo produto.'

  const defaultValues = product
    ? {
        id: product.id,
        name: product.name,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        min_stock: product.min_stock,
        category: product.category,
        is_compound: product.is_compound,
        extra_cost: product.extra_cost,
        components: existingComponents.map(c => ({
          component_type: c.component_type as 'recipe' | 'ingredient',
          recipe_id: c.recipe_id ?? undefined,
          ingredient_id: c.ingredient_id ?? undefined,
          quantity: c.quantity as number,
        })),
      }
    : undefined

  const isWaitingForComponents = product?.is_compound && isLoadingComponents

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {isWaitingForComponents ? (
          <div className="py-8 text-center text-sm text-slate-500">Carregando composição...</div>
        ) : (
          <ProductForm
            key={`${product?.id ?? 'new'}-${existingComponents.length}`}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            ingredients={ingredients}
            recipes={recipes}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
