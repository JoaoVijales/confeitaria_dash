'use client'

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DataItem {
  name: string
  Lucro: number
}

export function ProfitableProductsChart({ data }: { data: DataItem[] | undefined }) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis
          type="number"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R$${v}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Lucro']} />
        <Bar dataKey="Lucro" fill="#8884d8" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
