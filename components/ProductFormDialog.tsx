'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  cost: z.number().min(0, 'Custo deve ser positivo').optional(), // Nova coluna
  stock: z.number().min(0, 'Estoque deve ser positivo'),
  min_stock: z.number().min(0, 'Estoque mínimo deve ser positivo').optional(), // Nova coluna
})

type ProductFormValues = z.infer<typeof productSchema>

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductFormValues & { id?: string } | null // ID agora é string
  onSave: (product: ProductFormValues) => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductFormDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: {
      errors
    },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (product) {
      reset(product)
    } else {
      reset({
        name: '',
        category: 'Bolos',
        price: 0,
        cost: 0,
        stock: 0,
        min_stock: 5,
      })
    }
  }, [product, reset])

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Faça alterações no produto existente aqui.'
              : 'Adicione um novo produto à sua lista.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="col-span-3"
            />
            {errors.name && <p className="col-span-4 text-red-500 text-sm text-right">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoria
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bolos">Bolos</SelectItem>
                    <SelectItem value="Tortas">Tortas</SelectItem>
                    <SelectItem value="Cupcakes">Cupcakes</SelectItem>
                    <SelectItem value="Doces">Doces</SelectItem>
                    <SelectItem value="Salgados">Salgados</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="col-span-4 text-red-500 text-sm text-right">{errors.category.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Preço
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price', {
                valueAsNumber: true
              })}
              className="col-span-3"
            />
            {errors.price && <p className="col-span-4 text-red-500 text-sm text-right">{errors.price.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              Custo
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              {...register('cost', {
                valueAsNumber: true
              })}
              className="col-span-3"
            />
            {errors.cost && <p className="col-span-4 text-red-500 text-sm text-right">{errors.cost.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Estoque
            </Label>
            <Input
              id="stock"
              type="number"
              {...register('stock', {
                valueAsNumber: true
              })}
              className="col-span-3"
            />
            {errors.stock && <p className="col-span-4 text-red-500 text-sm text-right">{errors.stock.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min_stock" className="text-right">
              Estoque Mínimo
            </Label>
            <Input
              id="min_stock"
              type="number"
              {...register('min_stock', {
                valueAsNumber: true
              })}
              className="col-span-3"
            />
            {errors.min_stock && <p className="col-span-4 text-red-500 text-sm text-right">{errors.min_stock.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">
              Salvar mudanças
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}