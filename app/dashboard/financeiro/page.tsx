'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { KpiCard } from "@/components/KpiCard";
import { DollarSign, TrendingUp, TrendingDown, Percent, Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancials } from "@/hooks/useFinancials";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SectionTracker } from '@/components/SectionTracker';

const ChartSkeleton = () => <Skeleton className="h-[260px] w-full" />

const RevenueExpensesChart = dynamic(
  () => import('@/components/charts/RevenueExpensesChart').then(m => ({ default: m.RevenueExpensesChart })),
  { loading: ChartSkeleton, ssr: false }
)

const ExpensesPieChart = dynamic(
  () => import('@/components/charts/ExpensesPieChart').then(m => ({ default: m.ExpensesPieChart })),
  { loading: ChartSkeleton, ssr: false }
)

export default function FinanceiroPage() {
  const { data: financials, isLoading, error } = useFinancials();
  const [filterPeriod, setFilterPeriod] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');

  const categories = ['Ingredientes', 'Embalagens', 'Aluguel', 'Energia', 'Marketing', 'Outros', 'Todos'];
  const types = ['Receita', 'Despesa', 'Todos'];

  const periodStart = useMemo((): Date | null => {
    const now = new Date();
    if (filterPeriod === 'Hoje') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filterPeriod === 'Semana') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    if (filterPeriod === 'Mes') return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return null;
  }, [filterPeriod]);

  const filteredTransactions = useMemo(
    () =>
      financials?.recentTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const matchesPeriod = !periodStart || transactionDate >= periodStart;
        const matchesCategory = filterCategory === 'Todos' || transaction.category === filterCategory;
        const matchesType = filterType === 'Todos' || transaction.type === filterType;
        return matchesPeriod && matchesCategory && matchesType;
      }) || [],
    [financials, periodStart, filterCategory, filterType]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Skeleton className="col-span-1 lg:col-span-3 h-80 w-full" />
          <Skeleton className="col-span-1 lg:col-span-2 h-80 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Erro ao carregar dados financeiros" description="Tente novamente mais tarde." icon={<Wallet className="h-12 w-12" />} />
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <SectionTracker secao="financeiro" />
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800">
        Financeiro
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Receita Total"
          value={financials?.totalRevenue || 0}
          icon={<DollarSign />}
          prefix="R$ "
          gradient="bg-gradient-to-br from-green-50 to-emerald-50"
        />
        <KpiCard
          title="Despesas Totais"
          value={financials?.totalExpenses || 0}
          icon={<TrendingDown />}
          prefix="R$ "
          gradient="bg-gradient-to-br from-red-50 to-rose-50"
        />
        <KpiCard
          title="Lucro Líquido"
          value={financials?.netProfit || 0}
          icon={<TrendingUp />}
          prefix="R$ "
          gradient="bg-gradient-to-br from-purple-50 to-violet-50"
        />
        <KpiCard
          title="Margem de Lucro"
          value={financials?.profitMargin || 0}
          icon={<Percent />}
          suffix="%"
          gradient="bg-gradient-to-br from-pink-50 to-rose-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="col-span-1 lg:col-span-3 rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Receitas vs Despesas</CardTitle>
            <CardDescription className="text-slate-600">
              Últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <RevenueExpensesChart data={financials?.revenueVsExpensesData} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ExpensesPieChart data={financials?.expensesByCategoryChartData} showLabel />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-slate-800">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select onValueChange={setFilterPeriod} value={filterPeriod}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todo o Período</SelectItem>
                <SelectItem value="Hoje">Hoje</SelectItem>
                <SelectItem value="Semana">Última Semana</SelectItem>
                <SelectItem value="Mes">Último Mês</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterCategory} value={filterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterType} value={filterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Tipo" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge className={transaction.type === 'Receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell className={`text-right font-semibold ${transaction.total > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {transaction.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
