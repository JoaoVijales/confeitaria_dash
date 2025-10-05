import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          email,
          phone,
          is_vip,
          birthday,
          segment,
          orders (created_at, total)
        `)
      if (error) {
        throw error
      }

      const customersWithLastPurchase = data.map(customer => {
        const lastPurchase = customer.orders.length > 0
          ? customer.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;
        const totalSpent = customer.orders.reduce((acc, order) => acc + order.total, 0);
        const totalOrders = customer.orders.length;

        return {
          ...customer,
          last_purchase: lastPurchase,
          total_spent: totalSpent,
          total_orders: totalOrders,
        }
      })

      return customersWithLastPurchase
    },
  })
}
