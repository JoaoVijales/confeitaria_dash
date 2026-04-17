import { useQuery } from '@tanstack/react-query'
import { getIngredients } from '@/app/actions/ingredients'

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  })
}
