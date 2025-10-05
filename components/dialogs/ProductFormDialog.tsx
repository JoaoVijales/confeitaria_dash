'use client'

import { ProductForm } from '@/components/forms/ProductForm'
import { ProductFormValues } from '@/lib/validations/product.schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductFormValues & { id?: string }
  onSubmit: (data: ProductFormValues) => void
  isSubmitting: boolean
}

export function ProductFormDialog({ open, onOpenChange, product, onSubmit, isSubmitting }: ProductFormDialogProps) {
  const title = product ? 'Editar Produto' : 'Adicionar Produto'
  const description = product ? 'Atualize os detalhes do produto.' : 'Preencha os detalhes do novo produto.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProductForm 
          defaultValues={product} 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  )
}
