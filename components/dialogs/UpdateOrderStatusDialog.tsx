'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type UpdateOrderStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (status: string) => void
  isSubmitting: boolean
  currentStatus: string
}

const orderStatusOptions = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Finalizado', 'Cancelado']

export function UpdateOrderStatusDialog({ open, onOpenChange, onSubmit, isSubmitting, currentStatus }: UpdateOrderStatusDialogProps) {
  let newStatus = currentStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Status do Pedido</DialogTitle>
          <DialogDescription>Selecione o novo status para este pedido.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select defaultValue={currentStatus} onValueChange={(value) => { newStatus = value }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {orderStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onSubmit(newStatus)} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
