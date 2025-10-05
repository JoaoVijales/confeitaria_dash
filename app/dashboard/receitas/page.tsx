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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useRecipes } from '@/hooks/useRecipes'
import { createRecipe, updateRecipe, deleteRecipe } from '@/app/actions/recipes'
import { RecipeFormDialog, RecipeFormValues } from '@/components/RecipeFormDialog'

type IngredientInRecipe = {
  id: string;
  name: string;
  unit: string;
  unit_cost: number;
};

type RecipeIngredient = {
  quantity: number;
  ingredients: IngredientInRecipe[] | null;
};

type ProductInRecipe = {
  id: string;
  name: string;
  price: number;
  cost: number;
};

type Recipe = {
  id: string;
  yield: number;
  products: ProductInRecipe[] | null;
  recipe_ingredients: RecipeIngredient[];
};

export default function ReceitasPage() {
  const { data: recipes, isLoading, error } = useRecipes()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    setIsDialogOpen(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setIsDialogOpen(true)
  }

  const handleDeleteRecipe = async (id: string) => {
    await deleteRecipe(id)
  }

  const handleSaveRecipe = async (data: RecipeFormValues) => {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, data);
    } else {
      await createRecipe(data);
    }
  }

  const calculateCost = (recipe: Recipe) => {
    const totalCost = recipe.recipe_ingredients.reduce((acc: number, ri: RecipeIngredient) => {
      if (!ri.ingredients || ri.ingredients.length === 0) return acc;
      return acc + (ri.ingredients[0].unit_cost * ri.quantity)
    }, 0)
    return totalCost / recipe.yield
  }

  const calculateMargin = (recipe: Recipe) => {
    const cost = calculateCost(recipe)
    if (!recipe.products || recipe.products.length === 0) return 0; // Handle null or empty products
    const price = recipe.products[0].price
    return ((price - cost) / price) * 100
  }

  if (error) {
    return <EmptyState title="Erro ao carregar receitas" description="Tente novamente mais tarde." icon={<Search className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-800">Receitas</h1>
          <Badge className="bg-purple-500 text-white rounded-full px-3 py-1 text-sm">
            {recipes?.length || 0} Receitas
          </Badge>
        </div>
        <Button onClick={handleAddRecipe} className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Receita
        </Button>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Receitas</CardTitle>
          <CardDescription className="text-slate-600">Gerencie as receitas dos seus produtos.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recipes && recipes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Produto</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ingredientes</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Custo Total</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Rendimento</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Margem</TableHead>
                  <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => (
                  <TableRow key={recipe.id} className="hover:bg-slate-50 transition-colors py-4">
                    <TableCell className="font-medium py-4 px-4">{recipe.products?.[0]?.name}</TableCell>
                    <TableCell className="py-4 px-4">{recipe.recipe_ingredients.length} itens</TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">
                      R$ {calculateCost(recipe).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right py-4 px-4">{recipe.yield} unidades</TableCell>
                    <TableCell className="text-right py-4 px-4">
                      <Badge
                        className={
                          calculateMargin(recipe) > 40
                            ? 'bg-green-100 text-green-800'
                            : calculateMargin(recipe) > 20
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {calculateMargin(recipe).toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditRecipe(recipe)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar receita</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteRecipe(recipe.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir receita</p>
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
              title="Nenhuma receita encontrada"
              description="Adicione uma nova receita para começar."
              icon={<Search className="h-12 w-12" />}
              action={{ label: "Adicionar Receita", onClick: handleAddRecipe }}
            />
          )}
        </CardContent>
      </Card>

      <RecipeFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        recipe={editingRecipe}
        onSave={handleSaveRecipe}
      />
    </div>
  )
}
