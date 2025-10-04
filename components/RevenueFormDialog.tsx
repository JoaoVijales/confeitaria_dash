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
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'

const revenueSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser positiva'),
  unit_value: z.number().min(0, 'Valor unitário deve ser positivo'),
  total: z.number().min(0, 'Total deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
})

type RevenueFormValues = z.infer<typeof revenueSchema>

type RevenueFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  revenue: RevenueFormValues & { id?: number } | null
  onSave: (data: RevenueFormValues) => void
}

export function RevenueFormDialog({
  open,
  onOpenChange,
  revenue,
  onSave,
}: RevenueFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueSchema),
  })

  useEffect(() => {
    if (revenue) {
      reset(revenue)
    } else {
      reset({
        description: '',
        quantity: 1,
        unit_value: 0,
        total: 0,
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [revenue, reset])

  const onSubmit: SubmitHandler<RevenueFormValues> = (data) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {revenue ? 'Editar Entrada' : 'Adicionar Entrada'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register('description')} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_value">Valor Unitário</Label>
              <Input id="unit_value" type="number" step="0.01" {...register('unit_value', { valueAsNumber: true })} />
              {errors.unit_value && <p className="text-red-500 text-sm">{errors.unit_value.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total">Total</Label>
              <Input id="total" type="number" step="0.01" {...register('total', { valueAsNumber: true })} />
              {errors.total && <p className="text-red-500 text-sm">{errors.total.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
            </div>
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
