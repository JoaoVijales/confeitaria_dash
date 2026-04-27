export const ORDER_STATUSES = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Finalizado', 'Cancelado'] as const
export type OrderStatus = typeof ORDER_STATUSES[number]

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Finalizado: 'bg-green-100 text-green-700',
  Pendente: 'bg-amber-100 text-amber-700',
  'Em Preparo': 'bg-blue-100 text-blue-700',
  Cancelado: 'bg-red-100 text-red-700',
}
