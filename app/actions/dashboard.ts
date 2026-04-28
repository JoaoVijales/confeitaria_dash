'use server'

import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'
import { buildMonthDateRange } from '@/lib/utils/date-range'
import { getLowStockIngredients, getLowStockProducts } from '@/lib/utils/stock-alert'
import type { IngredientData, RecipeData, ProductData } from '@/lib/utils/stock-alert'

type RecipeIngredient = { quantity: number; ingredients: { unit_cost: number }[] | { unit_cost: number } | null }
type Recipe = { yield: number; recipe_ingredients: RecipeIngredient[] }
type ProductWithRecipes = { price: number; name: string; recipes: Recipe[] }

function calculateProductCost(product: ProductWithRecipes): number {
  if (!product.recipes || product.recipes.length === 0) return 0
  const recipe = product.recipes[0]
  const totalCost = recipe.recipe_ingredients.reduce((acc, ri) => {
    const ingredient = Array.isArray(ri.ingredients) ? ri.ingredients[0] : ri.ingredients
    return acc + ((ingredient?.unit_cost ?? 0) * ri.quantity)
  }, 0)
  return recipe.yield > 0 ? totalCost / recipe.yield : 0
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

export async function getDashboardStats() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { curMonthStart, curMonthEnd, prevMonthStart, prevMonthEnd, todayStart, todayEnd } = buildMonthDateRange(new Date())

  const { data: curOrders, error: curOrdersErr } = await supabase
    .from('orders')
    .select('total')
    .eq('tenant_id', tenantId)
    .gte('created_at', curMonthStart)
    .lte('created_at', curMonthEnd)
  handleSupabaseError(curOrdersErr, 'getDashboardStats:curOrders', { tenantId })

  // Pedidos do mês anterior (para trend)
  const { data: prevOrders, error: prevOrdersErr } = await supabase
    .from('orders')
    .select('total')
    .eq('tenant_id', tenantId)
    .gte('created_at', prevMonthStart)
    .lte('created_at', prevMonthEnd)
  handleSupabaseError(prevOrdersErr, 'getDashboardStats:prevOrders', { tenantId })

  // Despesas do mês atual
  const { data: curExpenses, error: curExpensesErr } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('tenant_id', tenantId)
    .gte('date', curMonthStart)
    .lte('date', curMonthEnd)
  handleSupabaseError(curExpensesErr, 'getDashboardStats:curExpenses', { tenantId })

  // Despesas do mês anterior (para trend)
  const { data: prevExpenses, error: prevExpensesErr } = await supabase
    .from('expenses')
    .select('amount')
    .eq('tenant_id', tenantId)
    .gte('date', prevMonthStart)
    .lte('date', prevMonthEnd)
  handleSupabaseError(prevExpensesErr, 'getDashboardStats:prevExpenses', { tenantId })

  // Produtos com receitas para cálculo de margem
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('price, name, recipes (yield, recipe_ingredients (quantity, ingredients (unit_cost)))')
    .eq('tenant_id', tenantId)
  handleSupabaseError(productsErr, 'getDashboardStats:products', { tenantId })

  // Vendas de hoje
  const { data: dailySales, error: dailySalesErr } = await supabase
    .from('orders')
    .select('total')
    .eq('tenant_id', tenantId)
    .gte('created_at', todayStart)
    .lt('created_at', todayEnd)
  handleSupabaseError(dailySalesErr, 'getDashboardStats:dailySales', { tenantId })

  // Pedidos abertos
  const { data: openOrders, error: openOrdersErr } = await supabase
    .from('orders')
    .select('id')
    .eq('tenant_id', tenantId)
    .in('status', ['Pendente', 'Processando'])
  handleSupabaseError(openOrdersErr, 'getDashboardStats:openOrders', { tenantId })

  // Itens de pedido para produto mais vendido
  const { data: orderItems, error: orderItemsErr } = await supabase
    .from('order_items')
    .select('quantity, products (name)')
    .eq('tenant_id', tenantId)
    .limit(1000)
  handleSupabaseError(orderItemsErr, 'getDashboardStats:orderItems', { tenantId })

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const monthlyRevenue = (curOrders ?? []).reduce((acc, o) => acc + o.total, 0)
  const prevMonthRevenue = (prevOrders ?? []).reduce((acc, o) => acc + o.total, 0)

  const monthlyExpenses = (curExpenses ?? []).reduce((acc, e) => acc + e.amount, 0)
  const prevMonthExpenses = (prevExpenses ?? []).reduce((acc, e) => acc + e.amount, 0)

  const monthlyProfit = monthlyRevenue - monthlyExpenses
  const prevMonthProfit = prevMonthRevenue - prevMonthExpenses

  const typedProducts = products as ProductWithRecipes[]
  const productsWithCost = typedProducts.map(p => ({
    name: p.name,
    cost: calculateProductCost(p),
    price: p.price,
  }))

  const productsWithMargin = productsWithCost.filter(p => p.cost > 0)
  const averageMargin = productsWithMargin.length > 0
    ? productsWithMargin.reduce((acc, p) => acc + ((p.price - p.cost) / p.price) * 100, 0) / productsWithMargin.length
    : 0

  const topProfitableProducts = productsWithCost
    .map(p => ({ name: p.name, Lucro: Math.round((p.price - p.cost) * 100) / 100 }))
    .sort((a, b) => b.Lucro - a.Lucro)
    .slice(0, 5)

  const expensesByCategoryData = (curExpenses ?? []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)
  const expensesByCategoryChartData = Object.entries(expensesByCategoryData)
    .map(([name, value]) => ({ name, value }))

  const dailySalesTotal = (dailySales ?? []).reduce((acc, o) => acc + o.total, 0)

  const productSales = (orderItems ?? []).reduce((acc, item) => {
    const name = Array.isArray(item.products) && item.products[0]?.name
      ? item.products[0].name as string
      : null
    if (name) acc[name] = (acc[name] ?? 0) + item.quantity
    return acc
  }, {} as Record<string, number>)

  const topSellingProduct = Object.entries(productSales)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)[0] ?? { name: 'N/A', count: 0 }

  return {
    dailySales: { total: dailySalesTotal },
    openOrders: { count: (openOrders ?? []).length },
    topSellingProduct,
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    averageMargin,
    topProfitableProducts,
    expensesByCategoryChartData,
    trends: {
      revenue: calcTrend(monthlyRevenue, prevMonthRevenue),
      expenses: calcTrend(monthlyExpenses, prevMonthExpenses),
      profit: calcTrend(monthlyProfit, prevMonthProfit),
    },
  }
}

export async function getTopProductsChartData() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data, error } = await supabase
    .from('order_items')
    .select('quantity, products (name)')
    .eq('tenant_id', tenantId)
    .limit(1000)
  handleSupabaseError(error, 'getTopProductsChartData', { tenantId })

  const productSales = (data ?? []).reduce((acc, item) => {
    const name = Array.isArray(item.products) && item.products[0]?.name
      ? (item.products[0].name as string)
      : null
    if (name) acc[name] = (acc[name] ?? 0) + item.quantity
    return acc
  }, {} as Record<string, number>)

  return Object.entries(productSales)
    .map(([name, vendidos]) => ({ name, vendidos }))
    .sort((a, b) => b.vendidos - a.vendidos)
    .slice(0, 5)
}

export async function getSalesChartData() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total')
    .eq('tenant_id', tenantId)
    .gte('created_at', since.toISOString())
  handleSupabaseError(error, 'getSalesChartData', { tenantId })

  const salesByDay = (data ?? []).reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString('pt-BR', { weekday: 'short' })
    acc[date] = (acc[date] ?? 0) + order.total
    return acc
  }, {} as Record<string, number>)

  return Object.entries(salesByDay).map(([name, vendas]) => ({ name, vendas }))
}

export async function getStockAlertData() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const [ingResult, prodResult, recResult] = await Promise.all([
    supabase
      .from('ingredients')
      .select('id, name, unit, current_stock, min_stock')
      .eq('tenant_id', tenantId),
    supabase
      .from('products')
      .select('id, name, stock, min_stock')
      .eq('tenant_id', tenantId),
    supabase
      .from('recipes')
      .select('id, recipe_ingredients(ingredient_id, quantity)')
      .eq('tenant_id', tenantId),
  ])

  handleSupabaseError(ingResult.error, 'getStockAlertData:ingredients', { tenantId })
  handleSupabaseError(prodResult.error, 'getStockAlertData:products', { tenantId })
  handleSupabaseError(recResult.error, 'getStockAlertData:recipes', { tenantId })

  const lowIngredients = getLowStockIngredients(
    (ingResult.data ?? []) as unknown as IngredientData[],
    (recResult.data ?? []) as unknown as RecipeData[],
  )
  const lowProducts = getLowStockProducts((prodResult.data ?? []) as unknown as ProductData[])

  return { lowIngredients, lowProducts, total: lowIngredients.length + lowProducts.length }
}
