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
import { useExpenses } from '@/hooks/useExpenses'
import { ExpenseFormDialog } from '@/components/dialogs/ExpenseFormDialog'
import { useDeleteExpense } from '@/hooks/useMutations'
import { ExpenseFormValues } from '@/lib/validations/expense.schema'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQueryClient } from '@tanstack/react-query'
import { logError } from '@/lib/logger'


type Expense = ExpenseFormValues & { id: string; ingredient_purchase_id?: number | null };

const categoryColors: { [key: string]: string } = {
  Ingredientes: "bg-blue-100 text-blue-800",
  Embalagens: "bg-purple-100 text-purple-800",
  Utensílios: "bg-orange-100 text-orange-800",
  Aluguel: "bg-red-100 text-red-800",
  Energia: "bg-yellow-100 text-yellow-800",
  Marketing: "bg-green-100 text-green-800",
  Outros: "bg-gray-100 text-gray-800",
};

export default function SaidasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: expensesData, isLoading, error } = useExpenses(currentPage, itemsPerPage)
  const expenses = expensesData?.entries || []
  const totalPages = expensesData?.totalPages || 1

  const deleteMutation = useDeleteExpense()
  const queryClient = useQueryClient()

  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDeleteExpense = async (id: string) => {
    const previousData = expensesData;
    queryClient.setQueryData(['expenses', currentPage, itemsPerPage], (old: typeof expensesData) => ({
      ...old,
      entries: old ? old.entries.filter((e: Expense) => e.id !== id) : [],
    }));

    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Saída excluída com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir saída.')
      logError('Erro ao excluir saída', error, { service: 'other', operation: 'deleteExpense' })
      queryClient.setQueryData(['expenses', currentPage, itemsPerPage], previousData);
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = expense.description.toLowerCase().includes(searchTermLower);
    const matchesCategory = filterCategory === 'Todos' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (error) {
    return <EmptyState title="Erro ao carregar saídas" description="Tente novamente mais tarde." icon={<Search className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Saídas</h1>
          <Badge className="bg-red-500 text-white rounded-full px-3 py-1 text-sm">
            {filteredExpenses.length} Saídas
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar saída..."
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 focus:ring-red-500 focus:border-red-500 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <Select onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1) }} value={filterCategory}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-lg border border-slate-200 focus:ring-red-500 focus:border-red-500 transition-all">
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(categoryColors).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="Todos">Todas as Categorias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddExpense} className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Saída
          </Button>
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-4">
        {filteredExpenses.length} saídas • R$ {filteredExpenses.reduce((acc, e) => acc + e.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Saídas</CardTitle>
          <CardDescription className="text-slate-600">Gerencie as saídas da sua confeitaria.</CardDescription>
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
          ) : filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Data</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Categoria</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Descrição</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Valor</TableHead>
                  <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-slate-50 transition-colors py-4">
                    <TableCell className="py-4 px-4">{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge className={`${categoryColors[expense.category] || "bg-gray-100 text-gray-800"}`}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium py-4 px-4">
                      <div className="flex items-center gap-2">
                        {expense.description}
                        {expense.ingredient_purchase_id && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">Compra</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600 py-4 px-4">
                      R$ {expense.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      {!expense.ingredient_purchase_id && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar saída</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id)}
                            disabled={!!expense.ingredient_purchase_id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{expense.ingredient_purchase_id ? 'Excluir via ingredientes' : 'Excluir saída'}</p>
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
              title="Nenhuma saída encontrada"
              description="Ajuste seus filtros ou adicione uma nova saída."
              icon={<Search className="h-12 w-12" />} 
              action={{ label: "Nova Saída", onClick: handleAddExpense }}
            />
          )}
        </CardContent>
        {filteredExpenses.length > 0 && (
          <CardFooter className="flex justify-between items-center py-4 px-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">Total: R$ {filteredExpenses.reduce((acc, e) => acc + e.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
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

      <ExpenseFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={editingExpense}
      />
    </div>
  )
}
