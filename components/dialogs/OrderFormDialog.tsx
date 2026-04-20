'use client'

import { OrderForm } from '@/components/forms/OrderForm'
import { OrderFormValues } from '@/lib/validations/order.schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useCustomers } from '@/hooks/useCustomers'
import { useProducts } from '@/hooks/useProducts'

type OrderFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: OrderFormValues & { id?: string }
  onSubmit: (data: OrderFormValues) => void
  isSubmitting: boolean
}

export function OrderFormDialog({ open, onOpenChange, order, onSubmit, isSubmitting }: OrderFormDialogProps) {
  const title = order ? 'Editar Pedido' : 'Novo Pedido'
  const description = order ? 'Atualize os detalhes do pedido.' : 'Preencha os detalhes do novo pedido.'

  const { data: customersData } = useCustomers()
  const { data: productsData } = useProducts()

  const customers = (customersData ?? []).map(c => ({ id: c.id, name: c.name }))
  const products = (productsData ?? []).map(p => ({ id: p.id, name: p.name, price: p.price }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <OrderForm
          customers={customers}
          products={products}
          defaultValues={order}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
