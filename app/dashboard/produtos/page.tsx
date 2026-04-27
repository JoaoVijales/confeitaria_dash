'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, Package, ChefHat, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Progress } from "@/components/ui/progress";
import { useProducts } from '@/hooks/useProducts'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useMutations'
import { ProductFormDialog } from '@/components/dialogs/ProductFormDialog'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { ProductFormValues } from '@/lib/validations/product.schema'
import { PRODUCT_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants/categories'
import { toast } from 'sonner'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type Product = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  category: string;
  is_compound: boolean;
  extra_cost: number;
};


export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts() as { data: Product[] | undefined; isLoading: boolean; error: Error | null };
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todos')

  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  const handleOpenForm = (product?: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleOpenConfirm = (product: Product) => {
    setSelectedProduct(product)
    setIsConfirmOpen(true)
  }

  const handleFormSubmit = (data: ProductFormValues) => {
    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data }, {
        onSuccess: () => {
          toast.success('Produto atualizado com sucesso!')
          setIsFormOpen(false)
        },
        onError: () => toast.error('Erro ao atualizar produto.'),
      })
    } else {
      createProductMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Produto criado com sucesso!')
          setIsFormOpen(false)
        },
        onError: () => toast.error('Erro ao criar produto.'),
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (!selectedProduct) return
    deleteProductMutation.mutate(selectedProduct.id, {
      onSuccess: () => {
        toast.success('Produto excluído com sucesso!')
        setIsConfirmOpen(false)
      },
      onError: () => toast.error('Erro ao excluir produto.'),
    })
  }

  const calculateMargin = (price: number, cost: number) => {
    if (cost === 0 || price === 0) return 0
    return ((price - cost) / price) * 100
  }

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const totalProducts = filteredProducts.length;

  if (error) {
    return <EmptyState title="Erro ao carregar produtos" description="Tente novamente mais tarde." icon={<Package className="h-12 w-12" />} />
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Produtos</h1>
            <Badge className="bg-pink-500 text-white rounded-full px-3 py-1 text-sm">
              {totalProducts} Produtos
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all"
              />
            </div>
            <Select onValueChange={setFilterCategory} value={filterCategory}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-slate-200"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas as Categorias</SelectItem>
                {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => handleOpenForm()} className="bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
            </Button>
          </div>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-100 rounded-t-xl py-3">
            <CardTitle className="font-semibold text-slate-800">Lista de Produtos</CardTitle>
            <CardDescription className="text-slate-600">Gerencie o catálogo de produtos da sua confeitaria.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Produto</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Categoria</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Preço</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Custo</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Margem</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Estoque</TableHead>
                    <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const margin = calculateMargin(product.price, product.cost)
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50 transition-colors py-4">
                        <TableCell className="font-medium py-4 px-4">{product.name}</TableCell>
                        <TableCell className="py-4 px-4"><Badge className={`${CATEGORY_COLORS[product.category] || "bg-gray-100"}`}>{product.category}</Badge></TableCell>
                        <TableCell className="text-right font-semibold py-4 px-4 text-slate-900">R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right py-4 px-4 text-slate-700">R$ {product.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right py-4 px-4">
                          <Badge className={margin > 50 ? 'bg-green-100 text-green-800' : margin > 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-4 px-4">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-medium">{product.stock} un.</span>
                            {product.stock < product.min_stock && <Badge variant="destructive" className="text-[10px] h-4 px-1">Baixo</Badge>}
                            <Progress value={Math.min((product.stock / (product.min_stock * 2)) * 100, 100)} className="w-16 h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="flex justify-center gap-2 py-4 px-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" asChild>
                                <Link href={`/dashboard/receitas?product_id=${product.id}`} aria-label="Ver Receita">
                                  <ChefHat className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Ver Receita</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => handleOpenForm(product)} aria-label="Editar Produto">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar Produto</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => handleOpenConfirm(product)} aria-label="Excluir Produto">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Excluir Produto</p></TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              </div>
            ) : (
              <EmptyState title="Nenhum produto encontrado" description="Adicione um novo produto para começar." icon={<Package className="h-12 w-12" />} action={{ label: "Adicionar Produto", onClick: () => handleOpenForm() }} />
            )}
          </CardContent>
        </Card>
      </div>

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        onSubmit={handleFormSubmit}
        isSubmitting={createProductMutation.isPending || updateProductMutation.isPending}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o produto "${selectedProduct?.name}"?`}
        isConfirming={deleteProductMutation.isPending}
      />
    </>
  )
}
