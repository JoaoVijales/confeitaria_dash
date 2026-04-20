'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, User, Phone, Mail, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCustomers } from '@/hooks/useCustomers'
import { useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useMutations'
import { CustomerFormDialog } from '@/components/dialogs/CustomerFormDialog'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { CustomerFormValues } from '@/lib/validations/customer.schema'
import { toast } from 'sonner'

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_vip: boolean;
  last_purchase: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
};

export default function CustomersPage() {
  const { data: customers, isLoading, error } = useCustomers()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined)

  const createCustomerMutation = useCreateCustomer()
  const updateCustomerMutation = useUpdateCustomer()
  const deleteCustomerMutation = useDeleteCustomer()

  const handleOpenForm = (customer?: Customer) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const handleOpenConfirm = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsConfirmOpen(true)
  }

  const handleFormSubmit = (data: CustomerFormValues) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    if (selectedCustomer) {
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data: formData }, {
        onSuccess: () => {
          toast.success('Cliente atualizado com sucesso!')
          setIsFormOpen(false)
        },
        onError: () => toast.error('Erro ao atualizar cliente.'),
      })
    } else {
      createCustomerMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Cliente criado com sucesso!')
          setIsFormOpen(false)
        },
        onError: () => toast.error('Erro ao criar cliente.'),
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (!selectedCustomer) return
    deleteCustomerMutation.mutate(selectedCustomer.id, {
      onSuccess: () => {
        toast.success('Cliente excluído com sucesso!')
        setIsConfirmOpen(false)
      },
      onError: () => toast.error('Erro ao excluir cliente.'),
    })
  }

  const filteredCustomers = customers?.filter(customer => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchTermLower) ||
      customer.email.toLowerCase().includes(searchTermLower) ||
      customer.phone.toLowerCase().includes(searchTermLower)
    );
  }) || [];

  const totalCustomers = filteredCustomers.length;

  return (
    <>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Clientes</h1>
            <Badge className="bg-amber-500 text-white rounded-full px-3 py-1 text-sm">
              {totalCustomers} Clientes
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
            <Button onClick={() => handleOpenForm()} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
            </Button>
          </div>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-100 rounded-t-xl py-3">
            <CardTitle className="font-semibold text-slate-800">Lista de Clientes</CardTitle>
            <CardDescription className="text-slate-600">Gerencie o relacionamento com seus clientes.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : error ? (
              <div className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Erro ao carregar clientes</h3>
                <p className="text-slate-500 mb-4">Ocorreu um problema ao buscar os dados.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Tentar Novamente</Button>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Cliente</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Contato</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Pedidos</TableHead>
                    <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Total Gasto</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Última Compra</TableHead>
                    <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50 transition-colors py-4">
                      <TableCell className="font-medium py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                            <span className="text-slate-700 font-bold">{customer.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {customer.name}
                              {customer.is_vip && <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">VIP</Badge>}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">ID: {customer.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-slate-600"><Mail className="h-3 w-3" /> {customer.email}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-600"><Phone className="h-3 w-3" /> {customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold py-4 px-4 text-slate-900">{customer.total_orders}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600 py-4 px-4">R$ {customer.total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-4 px-4 text-slate-600">{customer.last_purchase ? new Date(customer.last_purchase).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="flex justify-center gap-2 py-4 px-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => handleOpenForm(customer)} aria-label="Editar cliente">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Editar Cliente</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={() => handleOpenConfirm(customer)} aria-label="Excluir cliente">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Excluir Cliente</p></TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <EmptyState title="Nenhum cliente encontrado" description="Adicione um novo cliente para começar." icon={<User className="h-12 w-12" />} action={{ label: "Adicionar Cliente", onClick: () => handleOpenForm() }} />
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={selectedCustomer}
        onSubmit={handleFormSubmit}
        isSubmitting={createCustomerMutation.isPending || updateCustomerMutation.isPending}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o cliente "${selectedCustomer?.name}"? Esta ação não pode ser desfeita.`}
        isConfirming={deleteCustomerMutation.isPending}
      />
    </>
  )
}
