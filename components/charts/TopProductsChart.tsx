'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, PieLabelRenderProps } from 'recharts'
import { useTopProductsChart } from '@/hooks/useTopProductsChart'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { PackagePlus } from 'lucide-react'



interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { name: string; vendidos: number; } }>;
  label?: string;
}

// Define CustomTooltip component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-300 rounded shadow-md">
        <p className="text-sm font-semibold">{`${label}`}</p>
        <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {
  const numericInnerRadius = innerRadius as number;
  const numericOuterRadius = outerRadius as number;
  const numericMidAngle = midAngle as number;
  const numericPercent = percent as number;

  const radius = numericInnerRadius + (numericOuterRadius - numericInnerRadius) * 0.5;
  const x = (cx as number) + radius * Math.cos(-numericMidAngle * Math.PI / 180);
  const y = (cy as number) + radius * Math.sin(-numericMidAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > (cx as number) ? 'start' : 'end'} dominantBaseline="central">
      {`${(numericPercent * 100).toFixed(0)}%`}
    </text>
  );
};

interface VendidosPayload {
  vendidos: number;
}

function hasVendidos(payload: unknown): payload is VendidosPayload {
  return typeof payload === 'object' && payload !== null && 'vendidos' in payload && typeof (payload as { vendidos: number }).vendidos === 'number';
}

const renderLegend = (props: { payload?: readonly { color?: string, value?: string, payload?: unknown }[] }) => {
  const { payload } = props;
  const total = payload ? payload.reduce((acc, entry) => {
    if (hasVendidos(entry.payload)) {
      return acc + entry.payload.vendidos;
    }
    return acc;
  }, 0) : 0;

  return (
    <ul className="flex flex-wrap justify-center mt-4 text-sm text-slate-600">
      {payload?.map((entry, index) => {
        if (hasVendidos(entry.payload)) {
          const percentage = ((entry.payload.vendidos / total) * 100).toFixed(0);
          return (
            <li key={`item-${index}`} className="flex items-center mr-4 mb-2">
              <span className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{`${entry.value} (${percentage}%)`}</span>
            </li>
          );
        }
        return null;
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