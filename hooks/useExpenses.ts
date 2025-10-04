import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expense_entries').select('*')
      if (error) {
        throw error
      }

      const expensesByCategory = data.reduce((acc, entry) => {
        if (!acc[entry.category]) {
          acc[entry.category] = 0;
        }
        acc[entry.category] += entry.total;
        return acc;
      }, {} as Record<string, number>);

      return {
        entries: data,
        expensesByCategory,
      }
    },
  })
}
