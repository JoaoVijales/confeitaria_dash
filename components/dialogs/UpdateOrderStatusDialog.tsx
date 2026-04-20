'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ORDER_STATUSES } from '@/lib/validations/order.schema'

type UpdateOrderStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (status: string) => void
  isSubmitting: boolean
  currentStatus: string
}

export function UpdateOrderStatusDialog({ open, onOpenChange, onSubmit, isSubmitting, currentStatus }: UpdateOrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  useEffect(() => {
    setSelectedStatus(currentStatus)
  }, [currentStatus, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Status do Pedido</DialogTitle>
          <DialogDescription>Selecione o novo status para este pedido.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onSubmit(selectedStatus)} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
