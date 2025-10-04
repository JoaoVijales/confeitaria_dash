import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useRevenues() {
  return useQuery({
    queryKey: ['revenues'],
    queryFn: async () => {
      const { data, error } = await supabase.from('revenue_entries').select('*')
      if (error) {
        throw error
      }

      const totalAmount = data.reduce((acc, entry) => acc + entry.total, 0);

      return {
        entries: data,
        totalAmount,
      }
    },
  })
}
