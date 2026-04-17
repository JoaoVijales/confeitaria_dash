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
import { useEffect, useState } from 'react'

const ingredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  price_for_quantity: z.number().min(0, 'Preço deve ser positivo'),
  current_stock: z.number().min(0, 'Estoque atual deve ser positivo'),
  min_stock: z.number().min(0, 'Estoque mínimo deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
})

type IngredientFormValues = z.infer<typeof ingredientSchema>

type IngredientFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingredient: (IngredientFormValues & { id?: number }) | null
  onSave: (data: IngredientFormValues) => Promise<void>
}

const UNIT_OPTIONS = ['kg', 'g', 'L', 'ml', 'un']
const CATEGORY_OPTIONS = ['Secos', 'Laticínios', 'Frutas', 'Embalagens', 'Outros']

export function IngredientFormDialog({
  open,
  onOpenChange,
  ingredient,
  onSave,
}: IngredientFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
  })

  useEffect(() => {
    if (ingredient) {
      reset(ingredient)
    } else {
      reset({
        name: '',
        unit: 'g',
        quantity: 100,
        price_for_quantity: 0,
        current_stock: 0,
        min_stock: 0,
        category: 'Secos',
      })
    }
  }, [ingredient, reset])

  const quantity = watch('quantity') ?? 1
  const priceForQty = watch('price_for_quantity') ?? 0
  const unit = watch('unit') ?? ''
  const unitCostPreview = quantity > 0 ? priceForQty / quantity : 0

  const onSubmit: SubmitHandler<IngredientFormValues> = async (data) => {
    setIsSaving(true)
    try {
      await onSave(data)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {ingredient ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit && <p className="text-red-500 text-sm">{errors.unit.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" step="0.001" {...register('quantity', { valueAsNumber: true })} />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_for_quantity">Preço (R$)</Label>
              <Input id="price_for_quantity" type="number" step="0.01" {...register('price_for_quantity', { valueAsNumber: true })} />
              {errors.price_for_quantity && <p className="text-red-500 text-sm">{errors.price_for_quantity.message}</p>}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Custo unitário: R$ {unitCostPreview.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} / {unit || '—'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Estoque Atual</Label>
              <Input id="current_stock" type="number" {...register('current_stock', { valueAsNumber: true })} />
              {errors.current_stock && <p className="text-red-500 text-sm">{errors.current_stock.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Estoque Mínimo</Label>
              <Input id="min_stock" type="number" {...register('min_stock', { valueAsNumber: true })} />
              {errors.min_stock && <p className="text-red-500 text-sm">{errors.min_stock.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
