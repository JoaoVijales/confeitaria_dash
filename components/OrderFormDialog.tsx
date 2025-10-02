'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Order } from '@/lib/mock-data' // Import Order type

interface OrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onSave: (order: Order) => void
}

export function OrderFormDialog({
  open,
  onOpenChange,
  order,
  onSave,
}: OrderFormDialogProps) {
  const [customerName, setCustomerName] = useState(order?.customerName || '')
  const [customerEmail, setCustomerEmail] = useState(order?.customerEmail || '')
  const [total, setTotal] = useState(order?.total || 0)
  const [status, setStatus] = useState(order?.status || 'Pendente')

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName)
      setCustomerEmail(order.customerEmail)
      setTotal(order.total)
      setStatus(order.status)
    } else {
      setCustomerName('')
      setCustomerEmail('')
      setTotal(0)
      setStatus('Pendente')
    }
  }, [order])

  const handleSubmit = () => {
    const newOrder: Order = {
      id: order?.id || `ORD${Date.now()}`, // Simple ID generation for mock
      customerName,
      customerEmail,
      orderDate: order?.orderDate || new Date().toISOString().split('T')[0],
      total: parseFloat(total.toString()),
      status,
      items: order?.items || [], // Keep existing items or empty
    }
    onSave(newOrder)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{order ? 'Editar Pedido' : 'Adicionar Pedido'}</DialogTitle>
          <DialogDescription>
            {order
              ? 'Faça alterações no pedido existente aqui.'
              : 'Adicione um novo pedido à sua lista.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Cliente
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerEmail" className="text-right">
              Email
            </Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total
            </Label>
            <Input
              id="total"
              type="number"
              value={total}
              onChange={(e) => setTotal(parseFloat(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Processando">Processando</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Salvar mudanças
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}