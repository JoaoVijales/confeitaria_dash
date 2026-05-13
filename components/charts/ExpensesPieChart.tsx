'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, PieLabelRenderProps } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919']

interface DataItem {
  name: string
  value: number
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {
  if ((percent as number) < 0.05) return null
  const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5
  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * Math.PI / 180)
  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * Math.PI / 180)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${((percent as number) * 100).toFixed(0)}%`}
    </text>
  )
}

export function ExpensesPieChart({
  data,
  showLabel = false,
}: {
  data: DataItem[] | undefined
  showLabel?: boolean
}) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={65}
          dataKey="value"
          nameKey="name"
          label={showLabel ? renderLabel : undefined}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
