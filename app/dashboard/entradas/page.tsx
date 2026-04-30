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
import { PlusCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useRevenues } from '@/hooks/useRevenues'
import { RevenueFormDialog } from '@/components/dialogs/RevenueFormDialog'
import { useDeleteRevenue } from '@/hooks/useMutations'
import { RevenueFormValues } from '@/lib/validations/revenue.schema'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { logError } from '@/lib/logger'

type Revenue = RevenueFormValues & { id: string; order_id?: string | null };

export default function EntradasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: revenuesData, isLoading, error } = useRevenues(currentPage, itemsPerPage)
  const revenues = revenuesData?.entries || []
  const totalAmount = revenuesData?.totalAmount || 0
  const totalPages = revenuesData?.totalPages || 1

  const deleteMutation = useDeleteRevenue()
  const queryClient = useQueryClient()

  const handleAddRevenue = () => {
    setEditingRevenue(null)
    setIsDialogOpen(true)
  }

  const handleEditRevenue = (revenue: Revenue) => {
    setEditingRevenue(revenue)
    setIsDialogOpen(true)
  }

  const handleDeleteRevenue = async (id: string) => {
    // Optimistic update
    const previousRevenues = revenuesData?.entries;
    queryClient.setQueryData(['revenues', currentPage, itemsPerPage], (old: { entries: Revenue[], totalAmount: number, totalPages: number } | undefined) => ({
      ...old,
      entries: old ? old.entries.filter((r: Revenue) => r.id !== id) : [],
    }));

    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Entrada excluída com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir entrada.')
      logError('Erro ao excluir entrada', error, { service: 'other', operation: 'deleteRevenue' })
      // Rollback on error
      queryClient.setQueryData(['revenues', currentPage, itemsPerPage], previousRevenues);
    }
  }

  const filteredRevenues = revenues.filter(revenue => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      revenue.description.toLowerCase().includes(searchTermLower)
    );
  }) || [];

  if (error) {
    return <EmptyState title="Erro ao carregar entradas" description="Tente novamente mais tarde." icon={<Search className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Entradas</h1>
          <Badge className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm">
            {filteredRevenues.length} Entradas
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar entrada..."
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <Button onClick={handleAddRevenue} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Entrada
          </Button>
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-4">
        {filteredRevenues.length} entradas • R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Entradas</CardTitle>
          <CardDescription className="text-slate-600">Gerencie as entradas da sua confeitaria.</CardDescription>
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
          ) : filteredRevenues.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Data</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Descrição</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Qtd</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Valor Unit</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Total</TableHead>
                  <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRevenues.map((revenue) => (
                  <TableRow key={revenue.id} className="hover:bg-slate-50 transition-colors py-4">
                    <TableCell className="py-4 px-4">{new Date(revenue.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium py-4 px-4">
                      <div className="flex items-center gap-2">
                        {revenue.description}
                        {revenue.order_id && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Pedido</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 px-4">{revenue.quantity}</TableCell>
                    <TableCell className="text-right py-4 px-4">
                      R$ {revenue.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600 py-4 px-4">
                      R$ {revenue.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      {!revenue.order_id && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditRevenue(revenue)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar entrada</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteRevenue(revenue.id)}
                            disabled={!!revenue.order_id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{revenue.order_id ? 'Excluir via pedido' : 'Excluir entrada'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <EmptyState
              title="Nenhuma entrada encontrada"
              description="Ajuste seus filtros ou adicione uma nova entrada."
              icon={<Search className="h-12 w-12" />} 
              action={{ label: "Nova Entrada", onClick: handleAddRevenue }}
            />
          )}
        </CardContent>
        {filteredRevenues.length > 0 && (
          <CardFooter className="flex justify-between items-center py-4 px-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">Total: R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600">Página {currentPage} de {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <RevenueFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        revenue={editingRevenue}
      />
    </div>
  )
}
