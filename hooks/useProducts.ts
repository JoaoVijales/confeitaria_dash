import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          cost, // Nova coluna
          stock,
          min_stock, // Nova coluna
          category
        `)
      if (error) {
        throw error
      }
      return data
    },
  })
}
