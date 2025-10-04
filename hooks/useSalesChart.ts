import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useSalesChart() {
  return useQuery({
    queryKey: ['sales-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString())

      if (error) throw error

      const salesData = data.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString('pt-BR', { weekday: 'short' });
        const total = order.total;
        if (!acc[date]) {
          acc[date] = { total: 0 };
        }
        acc[date].total += total;
        return acc;
      }, {} as Record<string, { total: number }>);

      const chartData = Object.entries(salesData).map(([date, { total }]) => ({
        name: date,
        vendas: total,
      }));

      return chartData;
    },
  })
}
