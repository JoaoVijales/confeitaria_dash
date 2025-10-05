'use client'

import { OrderForm } from '@/components/forms/OrderForm'
import { OrderFormValues } from '@/lib/validations/order.schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

// Assuming you'll pass customer and product data needed for the form

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <OrderForm 
          defaultValues={order} 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  )
}
