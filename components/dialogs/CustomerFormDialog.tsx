'use client'

import { CustomerForm } from '@/components/forms/CustomerForm'
import { CustomerFormValues } from '@/lib/validations/customer.schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

type CustomerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: CustomerFormValues & { id?: string }
  onSubmit: (data: CustomerFormValues) => void
  isSubmitting: boolean
}

export function CustomerFormDialog({ open, onOpenChange, customer, onSubmit, isSubmitting }: CustomerFormDialogProps) {
  const title = customer ? 'Editar Cliente' : 'Adicionar Cliente'
  const description = customer ? 'Atualize os detalhes do cliente.' : 'Preencha os detalhes do novo cliente.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CustomerForm 
          defaultValues={customer} 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  )
}
