import { useQuery } from '@tanstack/react-query'
import { getExpenses } from '@/app/actions/expenses'

export function useExpenses(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['expenses', page, pageSize],
    queryFn: async () => {
      const data = (await getExpenses()) ?? []

      const expensesByCategory = data.reduce((acc, entry) => {
        if (!acc[entry.category]) {
          acc[entry.category] = 0;
        }
        acc[entry.category] += entry.total;
        return acc;
      }, {} as Record<string, number>);

      // Implementação de paginação simples no cliente
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedEntries = data.slice(startIndex, endIndex);
      const totalPages = Math.ceil(data.length / pageSize);

      return {
        entries: paginatedEntries,
        expensesByCategory,
        totalPages,
      }
    },
  })
}
