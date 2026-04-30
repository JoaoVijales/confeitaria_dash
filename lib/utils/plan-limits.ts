export const PLANS = {
  free:  { maxProducts: 0,        maxOrdersPerMonth: 0,        name: 'Sem plano ativo' },
  basic: { maxProducts: 10,       maxOrdersPerMonth: Infinity, name: 'Básico' },
  pro:   { maxProducts: 50,       maxOrdersPerMonth: Infinity, name: 'Pro' },
  max:   { maxProducts: Infinity, maxOrdersPerMonth: Infinity, name: 'Max' },
} as const

export type Plan = keyof typeof PLANS

export function getPlanLimits(plan: Plan) {
  return PLANS[plan] ?? PLANS.free
}

export function isAtProductLimit(plan: Plan, currentCount: number): boolean {
  return currentCount >= getPlanLimits(plan).maxProducts
}

export function isAtOrderLimit(plan: Plan, currentMonthOrders: number): boolean {
  return currentMonthOrders >= getPlanLimits(plan).maxOrdersPerMonth
}
