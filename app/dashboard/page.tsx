'use client'

import { KpiCard } from "@/components/KpiCard";
import { DollarSign, ShoppingCart, Trophy, Eye, PackagePlus } from "lucide-react";
import { dailySales, openOrders, topSellingProduct, allOrders, dailySalesData, openOrdersData, topSellingProductData } from "@/lib/mock-data";
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
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";

const statusColors: { [key: string]: string } = {
  Entregue: "bg-green-100 text-green-800",
  Pendente: "bg-yellow-100 text-yellow-800",
  Enviado: "bg-blue-100 text-blue-800",
  Processando: "bg-purple-100 text-purple-800",
};



export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
        Visão Geral
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard 
          title="Vendas do Dia" 
          value={dailySales.total} 
          icon={<DollarSign />} 
          trend={5.2} 
          data={dailySalesData} 
          prefix="R$ "
          gradient="bg-gradient-to-br from-green-50 to-emerald-50"
        />
        <KpiCard 
          title="Pedidos Abertos" 
          value={openOrders.count} 
          icon={<ShoppingCart />} 
          trend={-1.5} 
          data={openOrdersData}
          gradient="bg-gradient-to-br from-blue-50 to-sky-50"
        />
        <KpiCard 
          title="Mais Vendido" 
          value={124} 
          icon={<Trophy />} 
          trend={12} 
          data={topSellingProductData}
          gradient="bg-gradient-to-br from-amber-50 to-orange-50"
        />
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

      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-slate-800">Pedidos Recentes</CardTitle>
          <CardDescription className="text-slate-600">
            Últimos 5 pedidos recebidos hoje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : allOrders.length > 0 ? (
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
                {allOrders.slice(0, 5).map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <TableCell className="font-medium py-3 px-4">{order.id}</TableCell>
                    <TableCell className="py-3 px-4">{order.customerName}</TableCell>
                    <TableCell className="text-right py-3 px-4">
                      R$ {order.total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-3 px-4 text-slate-500">14:35</TableCell>
                    <TableCell className="text-center py-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              title="Nenhum pedido hoje" 
              description="Aproveite para relaxar ou preparar novos produtos!"
              icon={<PackagePlus />}
            />
          )}
        </CardContent>
        {allOrders.length > 0 && (
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