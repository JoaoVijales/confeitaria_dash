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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useRecipes } from '@/hooks/useRecipes'
import { createRecipe, updateRecipe, deleteRecipe } from '@/app/actions/recipes'
import { RecipeFormDialog, RecipeFormValues } from '@/components/RecipeFormDialog'
import {
  calculateTotalRecipeCost,
  calculateCostPerPortion,
} from '@/lib/utils/recipe-cost'
import { track } from '@/lib/analytics'
import { SectionTracker } from '@/components/SectionTracker'

type IngredientInRecipe = {
  id: string
  name: string
  unit: string
  unit_cost: number
}

type RecipeIngredient = {
  quantity: number
  unit?: string
  ingredients: IngredientInRecipe[] | null
}

type Recipe = {
  id: string
  name: string
  yield: number
  yield_unit: string
  recipe_ingredients: RecipeIngredient[]
}

type IngredientUnit = 'g' | 'kg' | 'ml' | 'L' | 'un'

function mapBaseUnit(unit: string): IngredientUnit {
  if (unit === 'kg') return 'kg'
  if (unit === 'g') return 'g'
  if (['L', 'l', 'litro', 'litros'].includes(unit)) return 'L'
  if (unit === 'ml') return 'ml'
  return 'un'
}

function getRecipeCosts(recipe: Recipe): { totalCost: number; costPerUnit: number } {
  const enriched = recipe.recipe_ingredients
    .map(ri => {
      const ing = ri.ingredients?.[0]
      if (!ing) return null
      return {
        quantity: ri.quantity,
        unit: mapBaseUnit(ri.unit ?? 'un'),
        unit_cost: ing.unit_cost,
        base_unit: mapBaseUnit(ing.unit),
      }
    })
    .filter(Boolean) as Array<{
      quantity: number
      unit: IngredientUnit
      unit_cost: number
      base_unit: IngredientUnit
    }>

  const totalCost = calculateTotalRecipeCost(enriched)
  const costPerUnit = calculateCostPerPortion(totalCost, recipe.yield)
  return { totalCost, costPerUnit }
}

export default function ReceitasPage() {
  const { data: recipes, isLoading, error } = useRecipes()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

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
    track('receita_deletada')
  }

  const handleSaveRecipe = async (data: RecipeFormValues) => {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, data)
    } else {
      await createRecipe(data)
      track('receita_criada')
    }
  }

  const filteredRecipes = (recipes ?? []).filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) as Recipe[]

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (error) {
    return <EmptyState title="Erro ao carregar receitas" description="Tente novamente mais tarde." icon={<Search className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <SectionTracker secao="receitas" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Receitas</h1>
          <Badge className="bg-purple-500 text-white rounded-full px-3 py-1 text-sm">
            {filteredRecipes.length} Receitas
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar receita..."
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 focus:ring-purple-500 focus:border-purple-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddRecipe} className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Receita
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Receitas</CardTitle>
          <CardDescription className="text-slate-600">
            Gerencie as receitas e acompanhe o custo de fabricação. A margem de lucro é definida no produto.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Nome</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ingredientes</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Custo Total</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Custo/Unidade</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Rendimento</TableHead>
                    <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipes.map((recipe) => {
                    const { totalCost, costPerUnit } = getRecipeCosts(recipe)

                    return (
                      <TableRow key={recipe.id} className="hover:bg-slate-50 transition-colors py-4">
                        <TableCell className="font-medium py-4 px-4">{recipe.name}</TableCell>
                        <TableCell className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {recipe.recipe_ingredients.slice(0, 3).map((ri, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                {ri.ingredients?.[0]?.name || 'Ingrediente'}
                              </Badge>
                            ))}
                            {recipe.recipe_ingredients.length > 3 && (
                              <span className="text-xs text-slate-500">+{recipe.recipe_ingredients.length - 3}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">
                          {fmt(totalCost)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">
                          {fmt(costPerUnit)}
                          <span className="text-xs text-slate-400 ml-1">/{recipe.yield_unit}</span>
                        </TableCell>
                        <TableCell className="text-right py-4 px-4">
                          {recipe.yield} {recipe.yield_unit}
                        </TableCell>
                        <TableCell className="flex justify-center gap-2 py-4 px-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => handleEditRecipe(recipe)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar receita</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteRecipe(recipe.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Excluir receita</p></TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
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
