'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderSchema, OrderFormValues } from '@/lib/validations/order.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

// Mock data - In a real app, this would come from props or a hook
const mockCustomers = [{ id: 'uuid-customer-1', name: 'Cliente Fiel' }]
const mockProducts = [{ id: 'uuid-product-1', name: 'Bolo de Chocolate', price: 50 }, { id: 'uuid-product-2', name: 'Torta de Limão', price: 45 }]
const orderStatusOptions = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Finalizado', 'Cancelado']

type OrderFormProps = {
  defaultValues?: OrderFormValues & { id?: string }
  onSubmit: (data: OrderFormValues) => void
  isSubmitting: boolean
}

export function OrderForm({ defaultValues, onSubmit, isSubmitting }: OrderFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: defaultValues || {
      customer_id: '',
      items: [],
      total: 0,
      status: 'Pendente',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchItems = watch('items')

  useEffect(() => {
    const total = watchItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    setValue('total', total)
  }, [watchItems, setValue])

  const addProduct = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (product) {
      append({ product_id: product.id, quantity: 1, unit_price: product.price })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Controller
          name="customer_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
              <SelectContent>
                {mockCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        {errors.customer_id && <p className="text-red-500 text-sm">{errors.customer_id.message}</p>}
      </div>

      <div>
        <Label>Itens do Pedido</Label>
        <div className="space-y-2 pt-2">
          {fields.map((field, index) => {
            const product = mockProducts.find(p => p.id === watchItems[index].product_id)
            return (
              <div key={field.id} className="flex items-center gap-2">
                <Input value={product?.name} disabled className="flex-1" />
                <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-20" />
                <Input value={(watchItems[index].quantity * watchItems[index].unit_price).toFixed(2)} disabled className="w-24" />
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            )
          })}
        </div>
        {errors.items && <p className="text-red-500 text-sm">{errors.items.message || errors.items.root?.message}</p>}
        
        <div className="pt-2">
            <Select onValueChange={addProduct}>
                <SelectTrigger><SelectValue placeholder="Adicionar produto..." /></SelectTrigger>
                <SelectContent>
                    {mockProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {orderStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Total</Label>
        <Input {...register('total', { valueAsNumber: true })} readOnly />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar Pedido'}
      </Button>
    </form>
  )
}
