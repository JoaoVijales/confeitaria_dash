import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useTopProductsChart() {
  return useQuery({
    queryKey: ['top-products-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, products (name)')
        .limit(1000) // Adjust limit as needed

      if (error) throw error

      const productSales = data.reduce((acc, item) => {
        const productName = item.products.name;
        if (!acc[productName]) {
          acc[productName] = 0;
        }
        acc[productName] += item.quantity;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(productSales)
        .map(([name, vendidos]) => ({ name, vendidos }))
        .sort((a, b) => b.vendidos - a.vendidos)
        .slice(0, 5);

      return chartData
    },
  })
}
