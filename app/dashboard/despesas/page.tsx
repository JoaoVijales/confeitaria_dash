'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useExpenses } from '@/hooks/useExpenses'
import { createExpense, updateExpense, deleteExpense } from '@/app/actions/expenses'
import { ExpenseFormDialog } from '@/components/ExpenseFormDialog'

type Expense = {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export default function DespesasPage() {
  const { data: expenses, isLoading, error } = useExpenses()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDeleteExpense = async (id: number) => {
    await deleteExpense(id)
  }

  const handleSaveExpense = async (data: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await createExpense(data);
    }
  }

  const filteredExpenses = expenses?.filter(expense => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      expense.description.toLowerCase().includes(searchTermLower) ||
      expense.category.toLowerCase().includes(searchTermLower)
    );
  }) || [];

  const totalExpenses = filteredExpenses.length;
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (error) {
    return <EmptyState title="Erro ao carregar despesas" description="Tente novamente mais tarde." icon={<Search className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-800">Despesas</h1>
          <Badge className="bg-red-500 text-white rounded-full px-3 py-1 text-sm">
            {totalExpenses} Despesas
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar despesa..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-red-500 focus:border-red-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddExpense} className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
          </Button>
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-4">
        {totalExpenses} despesas • R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Despesas</CardTitle>
          <CardDescription className="text-slate-600">Gerencie as despesas da sua confeitaria.</CardDescription>
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
                      <Badge className="bg-gray-100 text-gray-800">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium py-4 px-4">{expense.description}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600 py-4 px-4">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <TooltipProvider>
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
                            <p>Editar despesa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir despesa</p>
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
              title="Nenhuma despesa encontrada"
              description="Ajuste seus filtros ou adicione uma nova despesa."
              icon={<Search className="h-12 w-12" />}
              action={{ label: "Adicionar Despesa", onClick: handleAddExpense }}
            />
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={editingExpense}
        onSave={handleSaveExpense}
      />
    </div>
  )
}
