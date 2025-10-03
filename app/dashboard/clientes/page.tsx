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
import { allCustomers, Customer, monthlyClientGrowth } from '@/lib/mock-data'
import { Search, Mail, Phone, User, Crown, Star, Cake, MessageSquare, History, UserPlus, Users, ArrowUp, ArrowDown, Download } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const segmentColors: { [key: string]: string } = {
  VIP: "bg-yellow-100 text-yellow-800",
  Novo: "bg-blue-100 text-blue-800",
  Recorrente: "bg-green-100 text-green-800",
};

const CustomClientGrowthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-blue-500">{`Clientes: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(allCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSegment, setFilterSegment] = useState('Todos')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);
    const matchesSegment = filterSegment === 'Todos' || customer.segment === filterSegment;
    return matchesSearch && matchesSegment;
  });

  const totalClients = filteredCustomers.length;
  const newClientsThisMonth = monthlyClientGrowth[monthlyClientGrowth.length - 1].clients - monthlyClientGrowth[monthlyClientGrowth.length - 2].clients;
  const returnRate = ((customers.filter(c => c.segment === 'Recorrente').length / totalClients) * 100 || 0).toFixed(1);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-800">Clientes</h1>
          <Badge className="bg-pink-500 text-white rounded-full px-3 py-1 text-sm">
            {totalClients} Clientes
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={setFilterSegment} value={filterSegment}>
            <SelectTrigger className="w-[180px] rounded-lg border border-slate-200 focus:ring-pink-500 focus:border-pink-500 transition-all">
              <SelectValue placeholder="Filtrar por Segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os Segmentos</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Novo">Novo</SelectItem>
              <SelectItem value="Recorrente">Recorrente</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Total de Clientes</CardTitle>
            <CardDescription className="text-slate-600">Clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">{totalClients}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Novos este Mês</CardTitle>
            <CardDescription className="text-slate-600">Crescimento mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">+{newClientsThisMonth}</div>
            <p className="text-xs text-green-600 mt-1">+{(newClientsThisMonth / (totalClients - newClientsThisMonth) * 100 || 0).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Taxa de Retorno</CardTitle>
            <CardDescription className="text-slate-600">Clientes recorrentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">{returnRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-slate-800">Crescimento Mensal de Clientes</CardTitle>
          <CardDescription className="text-slate-600">Novos clientes por mês</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <TooltipProvider>
              <LineChart data={monthlyClientGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomClientGrowthTooltip />} />
                <Line type="monotone" dataKey="clients" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </TooltipProvider>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-100 rounded-t-xl py-3">
          <CardTitle className="font-semibold text-slate-800">Lista de Clientes</CardTitle>
          <CardDescription className="text-slate-600">Visualize os clientes cadastrados.</CardDescription>
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
          ) : filteredCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">ID</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Cliente</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Telefone</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Segmento</TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Última Compra</TableHead>
                  <TableHead className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Total Gasto</TableHead>
                  <TableHead className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50 transition-colors py-4">
                    <TableCell className="font-medium py-4 px-4">{customer.id}</TableCell>
                    <TableCell className="py-4 px-4 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-semibold text-xs">{customer.name.charAt(0)}</div>
                      {customer.name}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Mail className="h-4 w-4" /> {customer.email}
                      </a>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="h-4 w-4" /> {customer.phone}
                      </a>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge className={`${segmentColors[customer.segment] || "bg-gray-100 text-gray-800"} rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1`}>
                        {customer.segment === 'VIP' && <Crown className="h-3 w-3" />}
                        {customer.segment === 'Novo' && <UserPlus className="h-3 w-3" />}
                        {customer.segment === 'Recorrente' && <Users className="h-3 w-3" />}
                        {customer.segment}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-slate-500">{customer.lastPurchase}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 py-4 px-4">
                      R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver Perfil</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Histórico</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mensagem</p>
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
              icon={<Users className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
