import { useQuery } from '@tanstack/react-query'
import { getRevenues } from '@/app/actions/revenues'

export function useRevenues(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['revenues', page, pageSize],
    queryFn: async () => {
      const data = await getRevenues()

      const totalAmount = data.reduce((acc, entry) => acc + entry.total, 0);

      // Implementação de paginação simples no cliente
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedEntries = data.slice(startIndex, endIndex);
      const totalPages = Math.ceil(data.length / pageSize);

      return {
        entries: paginatedEntries,
        totalAmount,
        totalPages,
      }
    },
  })
}
