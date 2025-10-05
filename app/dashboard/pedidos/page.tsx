'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, ShoppingCart, CheckCircle, Clock, Loader } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useOrders } from '@/hooks/useOrders'
import { useCreateOrder, useUpdateOrderStatus, useDeleteOrder } from '@/hooks/useMutations'
import { OrderFormDialog } from '@/components/dialogs/OrderFormDialog'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { UpdateOrderStatusDialog } from '@/components/dialogs/UpdateOrderStatusDialog'
import { OrderFormValues } from '@/lib/validations/order.schema'
import { toast } from 'sonner'

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customers: { name: string }[] | null;
};

const statusColors: { [key: string]: string } = {
  Finalizado: "bg-green-100 text-green-700",
  Pendente: "bg-amber-100 text-amber-700",
  'Em Preparo': "bg-blue-100 text-blue-700",
  Cancelado: "bg-red-100 text-red-700",
};

const statusIcons: { [key: string]: React.ReactNode } = {
  Finalizado: <CheckCircle className="h-3 w-3" />,
  Pendente: <Clock className="h-3 w-3" />,
  'Em Preparo': <Loader className="h-3 w-3 animate-spin" />,
  Cancelado: <Trash2 className="h-3 w-3" />,
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')

  const createOrderMutation = useCreateOrder()
  const updateStatusMutation = useUpdateOrderStatus()
  const deleteOrderMutation = useDeleteOrder()

  const handleOpenForm = (order?: Order) => {
    setSelectedOrder(order)
    setIsFormOpen(true)
  }

  const handleOpenConfirm = (order: Order) => {
    setSelectedOrder(order)
    setIsConfirmOpen(true)
  }

  const handleOpenStatus = (order: Order) => {
    setSelectedOrder(order)
    setIsStatusOpen(true)
  }

  const handleFormSubmit = (data: OrderFormValues) => {
    createOrderMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Pedido criado com sucesso!')
        setIsFormOpen(false)
      },
      onError: (e) => toast.error(`Erro ao criar pedido: ${e.message}`),
    })
  }

  const handleDeleteConfirm = () => {
    if (!selectedOrder) return
    deleteOrderMutation.mutate(selectedOrder.id, {
      onSuccess: () => {
        toast.success('Pedido excluído com sucesso!')
        setIsConfirmOpen(false)
      },
      onError: () => toast.error('Erro ao excluir pedido.'),
    })
  }

  const handleStatusSubmit = (status: string) => {
    if (!selectedOrder) return
    updateStatusMutation.mutate({ id: selectedOrder.id, status }, {
      onSuccess: () => {
        toast.success('Status do pedido atualizado!')
        setIsStatusOpen(false)
      },
      onError: () => toast.error('Erro ao atualizar status.'),
    })
  }

  const filteredOrders = orders?.filter(order => {
    const customerName = order.customers?.[0]?.name || '';
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) || String(order.id).includes(searchTerm.toLowerCase());
  }) || [];

  if (error) {
    return <EmptyState title="Erro ao carregar pedidos" description="Tente novamente mais tarde." icon={<ShoppingCart className="h-12 w-12" />} />
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Pedidos</h1>
          <div className="flex items-center gap-4">
            <Input placeholder="Buscar por cliente ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
            <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Lista de Pedidos</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">#{order.id.substring(0, 6)}</TableCell>
                      <TableCell>{order.customers?.[0]?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status] || "bg-gray-100"} flex items-center gap-1 w-fit`}>
                          {statusIcons[order.status]} {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">R$ {order.total.toFixed(2)}</TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenStatus(order)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleOpenConfirm(order)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Nenhum pedido encontrado" description="Crie um novo pedido para começar." icon={<ShoppingCart className="h-12 w-12" />} />
            )}
          </CardContent>
        </Card>
      </div>

      <OrderFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={createOrderMutation.isPending}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o pedido #${selectedOrder?.id.substring(0, 6)}?`}
        isConfirming={deleteOrderMutation.isPending}
      />

      {selectedOrder && (
        <UpdateOrderStatusDialog
          open={isStatusOpen}
          onOpenChange={setIsStatusOpen}
          onSubmit={handleStatusSubmit}
          isSubmitting={updateStatusMutation.isPending}
          currentStatus={selectedOrder.status}
        />
      )}
    </>
  )
}
