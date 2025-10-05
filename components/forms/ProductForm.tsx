'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormValues } from '@/lib/validations/product.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type ProductFormProps = {
  defaultValues?: ProductFormValues & { id?: string }
  onSubmit: (data: ProductFormValues) => void
  isSubmitting: boolean
}

export function ProductForm({ defaultValues, onSubmit, isSubmitting }: ProductFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || { 
      name: '', 
      category: '', 
      price: 0, 
      cost: 0, 
      stock: 0, 
      min_stock: 0 
    },
  })

  const price = watch('price')
  const cost = watch('cost')

  const margin = price > 0 ? ((price - cost) / price) * 100 : 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Produto</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Input id="category" {...register('category')} />
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Custo (R$)</Label>
          <Input id="cost" type="number" step="0.01" {...register('cost', { valueAsNumber: true })} />
          {errors.cost && <p className="text-red-500 text-sm">{errors.cost.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Margem de Lucro</Label>
        <Input value={`${margin.toFixed(2)}%`} readOnly />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock">Estoque Atual</Label>
          <Input id="stock" type="number" step="1" {...register('stock', { valueAsNumber: true })} />
          {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Estoque Mínimo</Label>
          <Input id="min_stock" type="number" step="1" {...register('min_stock', { valueAsNumber: true })} />
          {errors.min_stock && <p className="text-red-500 text-sm">{errors.min_stock.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
