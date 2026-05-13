'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, ShoppingCart, CheckCircle, Clock, Loader, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useOrders } from '@/hooks/useOrders'
import { useCreateOrder, useUpdateOrderStatus, useDeleteOrder } from '@/hooks/useMutations'
import { OrderFormValues } from '@/lib/validations/order.schema'
import { ORDER_STATUS_COLORS } from '@/lib/constants/order-status'
import { toast } from 'sonner'
import { SectionTracker } from '@/components/SectionTracker'

const OrderFormDialog = dynamic(
  () => import('@/components/dialogs/OrderFormDialog').then(m => ({ default: m.OrderFormDialog })),
  { ssr: false }
)
const ConfirmDialog = dynamic(
  () => import('@/components/dialogs/ConfirmDialog').then(m => ({ default: m.ConfirmDialog })),
  { ssr: false }
)
const UpdateOrderStatusDialog = dynamic(
  () => import('@/components/dialogs/UpdateOrderStatusDialog').then(m => ({ default: m.UpdateOrderStatusDialog })),
  { ssr: false }
)

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customers: { name: string }[] | null;
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

  const filteredOrders = useMemo(
    () =>
      orders?.filter(order => {
        const customerName = order.customers?.[0]?.name || '';
        return customerName.toLowerCase().includes(searchTerm.toLowerCase()) || String(order.id).includes(searchTerm.toLowerCase());
      }) || [],
    [orders, searchTerm]
  );

  const totalOrders = filteredOrders.length;

  if (error) {
    return <EmptyState title="Erro ao carregar pedidos" description="Tente novamente mais tarde." icon={<ShoppingCart className="h-12 w-12" />} />
  }

  return (
    <>
      <SectionTracker secao="pedidos" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Pedidos</h1>
            <Badge className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm">
              {totalOrders} Pedidos
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <Button onClick={() => handleOpenForm()} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
            </Button>
          </div>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-100 rounded-t-xl py-3">
            <CardTitle className="font-semibold text-slate-800">Lista de Pedidos</CardTitle>
            <CardDescription className="text-slate-600">Acompanhe e gerencie os pedidos dos seus clientes.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">ID</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Cliente</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Data</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Total</TableHead>
                    <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors py-4">
                      <TableCell className="font-mono py-4 px-4">#{order.id.substring(0, 6)}</TableCell>
                      <TableCell className="py-4 px-4">{order.customers?.[0]?.name || 'N/A'}</TableCell>
                      <TableCell className="py-4 px-4">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="py-4 px-4">
                        <Badge className={`${ORDER_STATUS_COLORS[order.status] || "bg-gray-100"} flex items-center gap-1 w-fit`}>
                          {statusIcons[order.status]} {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold py-4 px-4 text-slate-900">R$ {order.total.toFixed(2)}</TableCell>
                      <TableCell className="flex justify-center gap-2 py-4 px-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => handleOpenStatus(order)} aria-label="Editar status">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Editar Status</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={() => handleOpenConfirm(order)} aria-label="Excluir pedido">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Excluir Pedido</p></TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <EmptyState title="Nenhum pedido encontrado" description="Crie um novo pedido para começar." icon={<ShoppingCart className="h-12 w-12" />} action={{ label: "Novo Pedido", onClick: () => handleOpenForm() }} />
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
