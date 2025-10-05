'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, Package } from 'lucide-react'
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
import { toast } from 'sonner'

type Product = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  category: string;
};

const categoryColors: { [key: string]: string } = {
  Bolos: "bg-blue-100 text-blue-800",
  Tortas: "bg-orange-100 text-orange-800",
  Cupcakes: "bg-green-100 text-green-800",
  Doces: "bg-purple-100 text-purple-800",
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
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)))

    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data: formData }, {
        onSuccess: () => {
          toast.success('Produto atualizado com sucesso!')
          setIsFormOpen(false)
        },
        onError: () => toast.error('Erro ao atualizar produto.'),
      })
    } else {
      createProductMutation.mutate(formData, {
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

  if (error) {
    return <EmptyState title="Erro ao carregar produtos" description="Tente novamente mais tarde." icon={<Package className="h-12 w-12" />} />
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Produtos</h1>
          <div className="flex items-center gap-4">
            <Input placeholder="Buscar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
            <Select onValueChange={setFilterCategory} value={filterCategory}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas as Categorias</SelectItem>
                <SelectItem value="Bolos">Bolos</SelectItem>
                <SelectItem value="Tortas">Tortas</SelectItem>
                <SelectItem value="Cupcakes">Cupcakes</SelectItem>
                <SelectItem value="Doces">Doces</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Lista de Produtos</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const margin = calculateMargin(product.price, product.cost)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell><Badge className={`${categoryColors[product.category] || "bg-gray-100"}`}>{product.category}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {product.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={margin > 50 ? 'bg-green-100 text-green-800' : margin > 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {product.stock} un.
                          {product.stock < product.min_stock && <Badge variant="destructive" className="ml-2">Baixo</Badge>}
                          <Progress value={(product.stock / (product.min_stock * 2)) * 100} className="w-20 mt-1" />
                        </TableCell>
                        <TableCell className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleOpenForm(product)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="icon" onClick={() => handleOpenConfirm(product)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Nenhum produto encontrado" description="Adicione um novo produto para começar." icon={<Package className="h-12 w-12" />} />
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
