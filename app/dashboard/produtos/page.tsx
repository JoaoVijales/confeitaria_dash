'use client'

import { useState, useEffect } from 'react'
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
import { PlusCircle, Edit, Trash2, Search, Package, ArrowUp, ArrowDown } from 'lucide-react'
import { allProducts, Product } from '@/lib/mock-data' // Import Product type
import { ProductFormDialog } from '@/components/ProductFormDialog'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Progress } from "@/components/ui/progress";

const categoryColors: { [key: string]: string } = {
  Bolos: "bg-blue-100 text-blue-800",
  Tortas: "bg-orange-100 text-orange-800",
  Cupcakes: "bg-green-100 text-green-800",
  Doces: "bg-purple-100 text-purple-800",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(allProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todos')
  const [filterStock, setFilterStock] = useState('Todos')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id))
  }

  const handleSaveProduct = (newProduct: Product) => {
    if (newProduct.id === editingProduct?.id) {
      // Editing existing product
      setProducts(products.map((product) => (product.id === newProduct.id ? newProduct : product)))
    } else {
      // Adding new product
      setProducts([...products, newProduct])
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || product.category === filterCategory;
    const matchesStock = filterStock === 'Todos' || 
      (filterStock === 'Baixo' && product.stock < 10) ||
      (filterStock === 'Normal' && product.stock >= 10 && product.stock < 50) ||
      (filterStock === 'Alto' && product.stock >= 50);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalProducts = filteredProducts.length;
  const totalStockValue = filteredProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-800">Produtos</h1>
          <Badge className="bg-pink-500 text-white rounded-full px-3 py-1 text-sm">
            {totalProducts} Produtos
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar produto..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={setFilterCategory} value={filterCategory}>
            <SelectTrigger className="w-[180px] rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all">
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas as Categorias</SelectItem>
              <SelectItem value="Bolos">Bolos</SelectItem>
              <SelectItem value="Tortas">Tortas</SelectItem>
              <SelectItem value="Cupcakes">Cupcakes</SelectItem>
              <SelectItem value="Doces">Doces</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setFilterStock} value={filterStock}>
            <SelectTrigger className="w-[180px] rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all">
              <SelectValue placeholder="Filtrar por Estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Baixo">Estoque Baixo (&lt; 10)</SelectItem>
              <SelectItem value="Normal">Estoque Normal (10-49)</SelectItem>
              <SelectItem value="Alto">Estoque Alto (&gt;= 50)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddProduct} className="bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-4">
        {totalProducts} produtos • R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} valor total estoque
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Produtos</CardTitle>
          <CardDescription className="text-slate-600">Gerencie os produtos da sua confeitaria.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">ID</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Imagem</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Nome</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Categoria</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Preço</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Estoque</TableHead>
                  <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50 transition-colors py-4">
                    <TableCell className="font-medium py-4 px-4">{product.id}</TableCell>
                    <TableCell className="py-4 px-4">
                      <img src="/placeholder.svg" alt="Product Image" className="w-16 h-16 rounded-lg object-cover" />
                    </TableCell>
                    <TableCell className="py-4 px-4">{product.name}</TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge className={`${categoryColors[product.category] || "bg-gray-100 text-gray-800"} rounded-full px-3 py-1 text-xs font-medium`}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right py-4 px-4">
                      <div className="flex flex-col items-end">
                        <span>{product.stock}</span>
                        {product.stock < 10 && (
                          <Badge variant="destructive" className="mt-1">Estoque baixo!</Badge>
                        )}
                        <Progress value={(product.stock / 50) * 100} className="w-24 mt-1" />
                      </div>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar produto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir produto</p>
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
              title="Nenhum produto encontrado" 
              description="Ajuste seus filtros ou adicione um novo produto."
              icon={<Package className="h-12 w-12" />}
              action={{ label: "Adicionar Produto", onClick: handleAddProduct }}
            />
          )}
        </CardContent>
      </Card>

      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  )
}
