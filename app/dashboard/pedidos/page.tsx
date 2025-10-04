'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, Search, Download, CheckCircle, Clock, Truck, Loader, ShoppingCart } from 'lucide-react'
import { OrderFormDialog } from '@/components/OrderFormDialog'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useOrders } from '@/hooks/useOrders'
import { updateOrder, deleteOrder } from '@/app/actions/orders'

type Order = {
  id: number;
  total: number;
  status: string;
  created_at: string;
  customers: {
    name: string;
    email: string;
  } | null;
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

const statusColors: { [key: string]: string } = {
  Entregue: "bg-green-100 text-green-700 border-green-200",
  Pendente: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
  Enviado: "bg-blue-100 text-blue-700 border-blue-200",
  Processando: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusIcons: { [key: string]: React.ReactNode } = {
  Entregue: <CheckCircle className="h-3 w-3" />,
  Pendente: <Clock className="h-3 w-3" />,
  Enviado: <Truck className="h-3 w-3" />,
  Processando: <Loader className="h-3 w-3 animate-spin" />,
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [filterPeriod, setFilterPeriod] = useState('Todos')

  const handleAddOrder = () => {
    setEditingOrder(null)
    setIsDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setIsDialogOpen(true)
  }

  const handleDeleteOrder = async (id: number) => {
    await deleteOrder(id)
  }

  const handleSaveOrder = async (newOrder: Omit<Order, 'id' | 'customers' | 'created_at' | 'order_items'> & { id?: number }) => {
    if (editingOrder) {
      await updateOrder(editingOrder.id, { status: newOrder.status });
    }
  }

  const calculateCost = (product: any) => {
    if (!product.recipes || product.recipes.length === 0) {
      return 0
    }
    const recipe = product.recipes[0]
    const totalCost = recipe.recipe_ingredients.reduce((acc: number, ri: any) => {
      return acc + (ri.ingredients.unit_cost * ri.quantity)
    }, 0)
    return totalCost / recipe.yield
  }

  const calculateOrderProfit = (order: Order) => {
    return order.order_items.reduce((acc, item) => {
      const cost = calculateCost(item.products)
      return acc + (item.products.price - cost) * item.quantity
    }, 0)
  }

  const filteredOrders = orders?.filter(order => {
    const customerName = order.customers?.name || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || String(order.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || order.status === filterStatus;
    const orderDate = new Date(order.created_at);
    const today = new Date();
    let matchesPeriod = true;

    if (filterPeriod === 'Hoje') {
      matchesPeriod = orderDate.toDateString() === today.toDateString();
    } else if (filterPeriod === 'Semana') {
      const lastWeek = new Date(today.setDate(today.getDate() - 7));
      matchesPeriod = orderDate >= lastWeek;
    } else if (filterPeriod === 'Mes') {
      const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
      matchesPeriod = orderDate >= lastMonth;
    }

    return matchesSearch && matchesStatus && matchesPeriod;
  }) || [];

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  if (error) {
    return <EmptyState title="Erro ao carregar pedidos" description="Tente novamente mais tarde." icon={<ShoppingCart className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-800">Pedidos</h1>
          <Badge className="bg-pink-500 text-white rounded-full px-3 py-1 text-sm">
            {totalOrders} Pedidos
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por cliente ou ID..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={setFilterStatus} value={filterStatus}>
            <SelectTrigger className="w-[180px] rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os Status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Processando">Processando</SelectItem>
              <SelectItem value="Enviado">Enviado</SelectItem>
              <SelectItem value="Entregue">Entregue</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setFilterPeriod} value={filterPeriod}>
            <SelectTrigger className="w-[180px] rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all">
              <SelectValue placeholder="Filtrar por Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todo o Período</SelectItem>
              <SelectItem value="Hoje">Hoje</SelectItem>
              <SelectItem value="Semana">Última Semana</SelectItem>
              <SelectItem value="Mes">Último Mês</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddOrder} className="bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pedido
          </Button>
          <Button variant="outline" className="flex items-center gap-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-4">
        {totalOrders} pedidos • R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Pedidos</CardTitle>
          <CardDescription className="text-slate-600">Gerencie os pedidos da sua confeitaria.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">ID</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Cliente</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Data</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Total</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Lucro Estimado</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 transition-colors py-4">
                    <TableCell className="font-medium py-4 px-4">{order.id}</TableCell>
                    <TableCell className="py-4 px-4">{order.customers?.name}</TableCell>
                    <TableCell className="py-4 px-4">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">
                      R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600 py-4 px-4">
                      R$ {calculateOrderProfit(order).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {statusIcons[order.status]} {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar pedido</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir pedido</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum pedido encontrado"
              description="Ajuste seus filtros ou adicione um novo pedido."
              icon={<ShoppingCart className="h-12 w-12" />}
              action={{ label: "Adicionar Pedido", onClick: handleAddOrder }}
            />
          )}
        </CardContent>
        {filteredOrders.length > 0 && (
          <CardFooter className="flex justify-between items-center py-4 px-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">Mostrando 1-{Math.min(10, filteredOrders.length)} de {filteredOrders.length} pedidos</div>
            {/* Pagination controls can be added here */}
          </CardFooter>
        )}
      </Card>

      <OrderFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        order={editingOrder}
        onSave={handleSaveOrder}
      />
    </div>
  )
}
