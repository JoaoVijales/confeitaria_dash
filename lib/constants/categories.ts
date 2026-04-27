export const PRODUCT_CATEGORIES = ['Bolos', 'Tortas', 'Cupcakes', 'Doces', 'Outros'] as const
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

export const CATEGORY_COLORS: Record<string, string> = {
  Bolos: 'bg-blue-100 text-blue-800',
  Tortas: 'bg-orange-100 text-orange-800',
  Cupcakes: 'bg-green-100 text-green-800',
  Doces: 'bg-purple-100 text-purple-800',
}
