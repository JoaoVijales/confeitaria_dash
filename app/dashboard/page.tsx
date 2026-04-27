'use client'

import { KpiCard } from "@/components/KpiCard";
import { DollarSign, ShoppingCart, Trophy, Eye, PackagePlus, TrendingUp, Percent, Wallet } from "lucide-react";
import { SalesChart } from "@/components/charts/SalesChart";
import { TopProductsChart } from "@/components/charts/TopProductsChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useOrders } from "@/hooks/useOrders";
import { StockAlertBanner } from "@/components/StockAlertBanner";
import { ORDER_STATUS_COLORS } from "@/lib/constants/order-status";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];


interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customers: {
    name: string;
  } | null;
}

export default function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: ordersData, isLoading: isLoadingOrders } = useOrders();

  const orders = ordersData as unknown as Order[];
  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800">
        Visão Geral
      </h1>

      <StockAlertBanner />

      <div className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-3 xl:grid-cols-6">
        {isLoadingStats ? (
          <>
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </>
        ) : (
          <>
            <KpiCard
              title="Vendas do Dia"
              value={stats?.dailySales.total || 0}
              icon={<DollarSign />}
              trend={stats?.trends.revenue}
              prefix="R$ "
              gradient="bg-gradient-to-br from-green-50 to-emerald-50"
            />
            <KpiCard
              title="Pedidos Abertos"
              value={stats?.openOrders.count || 0}
              icon={<ShoppingCart />}
              gradient="bg-gradient-to-br from-blue-50 to-sky-50"
            />
            <KpiCard
              title="Mais Vendido"
              value={stats?.topSellingProduct.name || 'N/A'}
              icon={<Trophy />}
              gradient="bg-gradient-to-br from-amber-50 to-orange-50"
            />
            <KpiCard
              title="Lucro do Mês"
              value={stats?.monthlyProfit || 0}
              icon={<TrendingUp />}
              trend={stats?.trends.profit}
              prefix="R$ "
              gradient="bg-gradient-to-br from-purple-50 to-violet-50"
            />
            <KpiCard
              title="Margem Média"
              value={stats?.averageMargin || 0}
              icon={<Percent />}
              suffix="%"
              gradient="bg-gradient-to-br from-pink-50 to-rose-50"
            />
            <KpiCard
              title="Balanço do Mês"
              value={stats?.monthlyRevenue || 0}
              icon={<Wallet />}
              trend={stats?.trends.revenue}
              prefix="R$ "
              gradient="bg-gradient-to-br from-cyan-50 to-teal-50"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="col-span-1 lg:col-span-3 rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Vendas Semanais</CardTitle>
            <CardDescription className="text-slate-600">
              Gráfico de vendas dos últimos 7 dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Produtos Mais Vendidos</CardTitle>
            <CardDescription className="text-slate-600">
              Distribuição dos produtos mais vendidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <TopProductsChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="col-span-1 lg:col-span-3 rounded-xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-800">Top 5 Produtos Mais Lucrativos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats?.topProfitableProducts} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="Lucro" fill="#8884d8" />
              </BarChart>
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
                  data={stats?.expensesByCategoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={80} // Converted to donut
                  dataKey="value"
                  nameKey="name"
                >
                  {stats?.expensesByCategoryChartData.map((entry, index) => (
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
          <CardTitle className="font-semibold text-slate-800">Pedidos Recentes</CardTitle>
          <CardDescription className="text-slate-600">
            Últimos 5 pedidos recebidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingOrders ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4">Pedido</TableHead>
                  <TableHead className="py-3 px-4">Cliente</TableHead>
                  <TableHead className="text-right py-3 px-4">Total</TableHead>
                  <TableHead className="py-3 px-4">Status</TableHead>
                  <TableHead className="text-right py-3 px-4">Horário</TableHead>
                  <TableHead className="text-center py-3 px-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <TableCell className="font-medium py-3 px-4">{order.id}</TableCell>
                    <TableCell className="py-3 px-4">{order.customers?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right py-3 px-4">
                      R$ {order.total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-3 px-4 text-slate-500">{new Date(order.created_at).toLocaleTimeString()}</TableCell>
                    <TableCell className="text-center py-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" asChild aria-label="Ver detalhes do pedido">
                        <Link href={`/dashboard/pedidos?id=${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <EmptyState
              title="Nenhum pedido hoje"
              description="Aproveite para relaxar ou preparar novos produtos!"
              icon={<PackagePlus />}
            />
          )}
        </CardContent>
        {recentOrders.length > 0 && (
          <CardFooter className="flex justify-center py-4">
            <Link href="/dashboard/pedidos" className="text-sm font-medium text-pink-600 hover:underline">
              Ver todos os pedidos →
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
