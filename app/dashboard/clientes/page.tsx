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
import { PlusCircle, Edit, Trash2, Search, User, Phone, Mail, Cake } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useCustomers } from '@/hooks/useCustomers'
import { deleteCustomer } from '@/app/actions/customers'

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  last_purchase: string | null;
  total_orders: number;
  total_spent: number;
};

export default function CustomersPage() {
  const { data: customers, isLoading, error } = useCustomers()
  const [searchTerm, setSearchTerm] = useState('')

  const handleDeleteCustomer = async (id: number) => {
    await deleteCustomer(id)
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

  const totalCustomers = filteredCustomers.length;

  if (error) {
    return <EmptyState title="Erro ao carregar clientes" description="Tente novamente mais tarde." icon={<User className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-800">Clientes</h1>
          <Badge className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm">
            {totalCustomers} Clientes
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar cliente..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Clientes</CardTitle>
          <CardDescription className="text-slate-600">Gerencie os clientes da sua confeitaria.</CardDescription>
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
          ) : filteredCustomers.length > 0 ? (
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
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{customer.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {customer.name}
                            {isBirthdayToday(customer.birthday) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Cake className="ml-2 h-4 w-4 text-pink-500 inline-block" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Aniversário hoje!</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {customer.total_spent > 1000 && ( // Placeholder for VIP logic
                              <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">VIP</Badge>
                            )}
                          </p>
                          <p className="text-sm text-slate-500">ID: {customer.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">{customer.total_orders}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600 py-4 px-4">
                      R$ {customer.total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {customer.last_purchase ? new Date(customer.last_purchase).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar cliente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir cliente</p>
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
              title="Nenhum cliente encontrado"
              description="Ajuste seus filtros ou adicione um novo cliente."
              icon={<User className="h-12 w-12" />}
              action={{ label: "Adicionar Cliente", onClick: () => {} }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
