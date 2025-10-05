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

type Order = {
  id: number;
  total: number;
  status: string;
  created_at: string;
  customers: {
    name: string;
    email: string;
  }[] | null;
  order_items: {
    quantity: number;
    products: {
      price: number;
      recipes: {
        yield: number;
        recipe_ingredients: {
          quantity: number;
          ingredients: {
            unit_cost: number;
          };
        }[];
      }[];
    };
  }[];
};

interface OrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onSave: (newOrder: Omit<Order, 'id' | 'customers' | 'created_at' | 'order_items'> & { id?: number }) => void
}

export function OrderFormDialog({
  open,
  onOpenChange,
  order,
  onSave,
}: OrderFormDialogProps) {
  const [customerName, setCustomerName] = useState(order?.customers?.[0]?.name || '')
  const [customerEmail, setCustomerEmail] = useState(order?.customers?.[0]?.email || '')
  const [total, setTotal] = useState(order?.total || 0)
  const [status, setStatus] = useState(order?.status || 'Pendente')

  useEffect(() => {
    if (order) {
      setCustomerName(order.customers?.[0]?.name || '')
      setCustomerEmail(order.customers?.[0]?.email || '')
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
    const newOrder = {
      id: order?.id,
      total: parseFloat(total.toString()),
      status,
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
              readOnly // Customer name should not be editable directly here
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
              readOnly // Customer email should not be editable directly here
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
              readOnly // Total should be calculated, not directly editable
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