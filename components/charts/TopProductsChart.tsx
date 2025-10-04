'use client'

import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts'
import { useTopProductsChart } from '@/hooks/useTopProductsChart'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { PackagePlus } from 'lucide-react'

const COLORS = ['#3B82F6', '#F87171', '#34D399', '#FB923C', '#A78BFA'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800">{data.name}</p>
        <p className="text-sm text-blue-500">{`${data.vendidos} unidades`}</p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props: any) => {
  const { payload } = props;
  const total = payload.reduce((acc: any, entry: any) => acc + entry.payload.vendidos, 0);

  return (
    <ul className="flex flex-wrap justify-center mt-4 text-sm text-slate-600">
      {payload.map((entry: any, index: number) => {
        const percentage = ((entry.payload.vendidos / total) * 100).toFixed(0);
        return (
          <li key={`item-${index}`} className="flex items-center mr-4 mb-2">
            <span className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{`${entry.value} (${percentage}%)`}</span>
          </li>
        );
      })}
    </ul>
  );
};

export function TopProductsChart() {
  const { data: chartData, isLoading, error } = useTopProductsChart();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <EmptyState
          title="Nenhum dado de produtos"
          description="Não há dados de produtos para exibir no momento."
          icon={<PackagePlus />}
        />
      </div>
    )
  }

  const totalValue = chartData.reduce((acc, entry) => acc + entry.vendidos, 0);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          innerRadius={80}
          paddingAngle={5}
          dataKey="vendidos"
          nameKey="name"
          label={renderCustomizedLabel} // Added custom label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none transition-opacity duration-300 hover:opacity-80" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-semibold text-slate-800">
          {totalValue}
        </text>
        <text x="50%" y="50%" dy={20} textAnchor="middle" dominantBaseline="middle" className="text-sm text-slate-500">
          Total de Vendas
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};