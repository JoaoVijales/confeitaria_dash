'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Edit, Trash2, User, Phone, Mail, Cake } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
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
  birthday: string | null;
  last_purchase: string | null;
  total_orders: number;
  total_spent: number;
  segment: string;
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

  const isBirthdayToday = (birthday: string | null) => {
    if (!birthday) return false;
    const today = new Date();
    const birthDate = new Date(birthday);
    return today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate();
  }

  const filteredCustomers = customers?.filter(customer => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchTermLower) ||
      customer.email.toLowerCase().includes(searchTermLower) ||
      customer.phone.toLowerCase().includes(searchTermLower)
    );
  }) || [];

  if (error) {
    return <EmptyState title="Erro ao carregar clientes" description="Tente novamente mais tarde." icon={<User className="h-12 w-12" />} />
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Clientes</h1>
          <div className="flex items-center gap-4">
            <Input placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
            <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Lista de Clientes</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                    <TableHead>Última Compra</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{customer.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {customer.name}
                              {isBirthdayToday(customer.birthday) && <Cake className="ml-2 h-4 w-4 text-pink-500 inline-block" />}
                              {customer.is_vip && <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">VIP</Badge>}
                            </p>
                            <p className="text-sm text-slate-500">ID: {customer.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> {customer.email}</div>
                        <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {customer.phone}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{customer.total_orders}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">R$ {customer.total_spent.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{customer.last_purchase ? new Date(customer.last_purchase).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(customer)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleOpenConfirm(customer)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Nenhum cliente encontrado" description="Adicione um novo cliente para começar." icon={<User className="h-12 w-12" />} />
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
