'use client'

import { useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { weeklySalesData, weeklyQuantityData, weeklyProfitData } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

const dataMap = {
  Receita: weeklySalesData,
  Quantidade: weeklyQuantityData,
  Lucro: weeklyProfitData,
};

const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = type === 'Receita' || type === 'Lucro'
      ? `R$${value.toLocaleString('pt-BR')}`
      : value;

    return (
      <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
        <p className="font-semibold text-slate-800">{`${label}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} • ${formattedValue}`}</p>
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  const [dataType, setDataType] = useState('Receita');

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button variant={dataType === 'Receita' ? 'default' : 'outline'} size="sm" onClick={() => setDataType('Receita')}>Receita</Button>
        <Button variant={dataType === 'Quantidade' ? 'default' : 'outline'} size="sm" onClick={() => setDataType('Quantidade')}>Quantidade</Button>
        <Button variant={dataType === 'Lucro' ? 'default' : 'outline'} size="sm" onClick={() => setDataType('Lucro')}>Lucro</Button>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={dataMap[dataType]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis
            dataKey="day"
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
            tickFormatter={(value) => dataType === 'Receita' || dataType === 'Lucro' ? `R$${value}` : value}
          />
          <Tooltip content={<CustomTooltip type={dataType} />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
          <ReferenceLine y={500} label="Meta" stroke="#F87171" strokeDasharray="3 3" />
          <Bar
            dataKey="value"
            fill="url(#salesGradient)"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}