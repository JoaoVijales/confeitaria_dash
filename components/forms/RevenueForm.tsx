'use client'

import { useEffect } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { revenueSchema, RevenueFormValues } from '@/lib/validations/revenue.schema'

type RevenueFormProps = {
  defaultValues?: RevenueFormValues & { id?: string }
  onSubmit: (data: RevenueFormValues) => void
  isSubmitting: boolean
}

export function RevenueForm({ defaultValues, onSubmit, isSubmitting }: RevenueFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueSchema),
    defaultValues: defaultValues || {
      date: new Date().toISOString().split('T')[0],
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
    },
  })

  const quantity = watch('quantity')
  const unit_price = watch('unit_price')

  useEffect(() => {
    const newTotal = (quantity || 0) * (unit_price || 0)
    setValue('total', newTotal)
  }, [quantity, unit_price, setValue])

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input id="quantity" type="number" step="1" {...register('quantity', { valueAsNumber: true })} />
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit_price">Valor Unitário</Label>
          <Input id="unit_price" type="number" step="0.01" {...register('unit_price', { valueAsNumber: true })} />
          {errors.unit_price && <p className="text-red-500 text-sm">{errors.unit_price.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="total">Total</Label>
        <Input id="total" type="number" step="0.01" {...register('total', { valueAsNumber: true })} readOnly />
        {errors.total && <p className="text-red-500 text-sm">{errors.total.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
