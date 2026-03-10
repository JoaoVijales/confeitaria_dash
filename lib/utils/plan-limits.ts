export const PLANS = {
  free: { maxProducts: 30, maxOrdersPerMonth: 50, name: 'Gratuito' },
  basic: { maxProducts: 200, maxOrdersPerMonth: Infinity, name: 'Básico' },
  pro: { maxProducts: Infinity, maxOrdersPerMonth: Infinity, name: 'Pro' },
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
