'use client'

import { KpiCard } from "@/components/KpiCard";
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const COLORS = ['#3B82F6', '#F87171', '#34D399', '#FB923C', '#A78BFA'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function FinanceiroPage() {
  const { data: financials, isLoading, error } = useFinancials();
  const [filterPeriod, setFilterPeriod] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');

  const categories = ['Ingredientes', 'Embalagens', 'Aluguel', 'Energia', 'Marketing', 'Outros', 'Todos'];
  const types = ['Receita', 'Despesa', 'Todos'];

  const filteredTransactions = financials?.recentTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    let matchesPeriod = true;
    let matchesCategory = true;
    let matchesType = true;

    if (filterPeriod === 'Hoje') {
      matchesPeriod = transactionDate.toDateString() === today.toDateString();
    } else if (filterPeriod === 'Semana') {
      const lastWeek = new Date(today.setDate(today.getDate() - 7));
      matchesPeriod = transactionDate >= lastWeek;
    } else if (filterPeriod === 'Mes') {
      const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
      matchesPeriod = transactionDate >= lastMonth;
    }

    if (filterCategory !== 'Todos') {
      matchesCategory = transaction.description.includes(filterCategory); // This is a simplification, ideally category would be a direct property
    }

    if (filterType !== 'Todos') {
      matchesType = transaction.type === filterType;
    }

    return matchesPeriod && matchesCategory && matchesType;
  }) || [];

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
    return <EmptyState title="Erro ao carregar dados financeiros" description="Tente novamente mais tarde." />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
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
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={financials?.revenueVsExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Receitas" stroke="#3B82F6" />
                <Line type="monotone" dataKey="Despesas" stroke="#F87171" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={financials?.expensesByCategoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={80} // Converted to donut
                  dataKey="value"
                  nameKey="name"
                  label={renderCustomizedLabel} // Added custom label
                >
                  {financials?.expensesByCategoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-slate-800">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Select onValueChange={setFilterPeriod} value={filterPeriod}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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
                  <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
