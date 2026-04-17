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
import { useQueryClient } from '@tanstack/react-query'
import { useIngredients } from '@/hooks/useIngredients'
import { createIngredient, updateIngredient, deleteIngredient } from '@/app/actions/ingredients'
import { IngredientFormDialog } from '@/components/IngredientFormDialog'
import { toast } from 'sonner'

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  unit_cost: number;
  current_stock: number;
  min_stock: number;
  category: string;
};

export default function IngredientesPage() {
  const queryClient = useQueryClient()
  const { data: ingredients, isLoading, error } = useIngredients()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddIngredient = () => {
    setEditingIngredient(null)
    setIsDialogOpen(true)
  }

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setIsDialogOpen(true)
  }

  const handleDeleteIngredient = async (id: number) => {
    try {
      await deleteIngredient(id)
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingrediente excluído com sucesso!')
    } catch {
      toast.error('Erro ao excluir ingrediente.')
    }
  }

  const handleSaveIngredient = async (data: Omit<Ingredient, 'id'>) => {
    if (editingIngredient) {
      await updateIngredient(editingIngredient.id, data)
    } else {
      await createIngredient(data)
    }
    queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    toast.success(editingIngredient ? 'Ingrediente atualizado!' : 'Ingrediente criado!')
  }

  const filteredIngredients = ingredients?.filter(ingredient => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      ingredient.name.toLowerCase().includes(searchTermLower) ||
      ingredient.category.toLowerCase().includes(searchTermLower)
    );
  }) || [];

  const totalIngredients = filteredIngredients.length;

  if (error) {
    return <EmptyState title="Erro ao carregar ingredientes" description="Tente novamente mais tarde." icon={<Search className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-800">Ingredientes</h1>
          <Badge className="bg-green-500 text-white rounded-full px-3 py-1 text-sm">
            {totalIngredients} Ingredientes
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar ingrediente..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-green-500 focus:border-green-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddIngredient} className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ingrediente
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Ingredientes</CardTitle>
          <CardDescription className="text-slate-600">Gerencie os ingredientes da sua confeitaria.</CardDescription>
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
          ) : filteredIngredients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Nome</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Categoria</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Custo Unitário</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Estoque Atual</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Estoque Mínimo</TableHead>
                  <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ingredient) => (
                  <TableRow key={ingredient.id} className="hover:bg-slate-50 transition-colors py-4">
                    <TableCell className="font-medium py-4 px-4">{ingredient.name}</TableCell>
                    <TableCell className="py-4 px-4">{ingredient.category}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">
                      R$ {ingredient.unit_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {ingredient.unit}
                    </TableCell>
                    <TableCell className="text-right py-4 px-4">
                      {ingredient.current_stock} {ingredient.unit}
                      {ingredient.current_stock < ingredient.min_stock && (
                        <Badge variant="destructive" className="ml-2">Estoque baixo!</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-4 px-4">{ingredient.min_stock} {ingredient.unit}</TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditIngredient(ingredient)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar ingrediente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteIngredient(ingredient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir ingrediente</p>
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
              title="Nenhum ingrediente encontrado"
              description="Ajuste seus filtros ou adicione um novo ingrediente."
              icon={<Search className="h-12 w-12" />} 
              action={{ label: "Adicionar Ingrediente", onClick: handleAddIngredient }}
            />
          )}
        </CardContent>
      </Card>

      <IngredientFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ingredient={editingIngredient}
        onSave={handleSaveIngredient}
      />
    </div>
  )
}
