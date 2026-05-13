'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataItem {
  name: string
  Receitas: number
  Despesas: number
}

export function RevenueExpensesChart({ data }: { data: DataItem[] | undefined }) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
        <Legend />
        <Line type="monotone" dataKey="Receitas" stroke="#3B82F6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Despesas" stroke="#F87171" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
