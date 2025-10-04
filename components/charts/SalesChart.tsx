'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useSalesChart } from '@/hooks/useSalesChart'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { PackagePlus } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = `R$${value.toLocaleString('pt-BR')}`

    return (
      <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
        <p className="font-semibold text-slate-800">{`${label} • ${formattedValue}`}</p>
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  const { data: chartData, isLoading, error } = useSalesChart();

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <EmptyState
          title="Nenhum dado de vendas"
          description="Não há dados de vendas para exibir no momento."
          icon={<PackagePlus />}
        />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
        <Bar
          dataKey="vendas"
          fill="url(#salesGradient)"
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}