'use server'

import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'

type RecipeIngredient = { quantity: number; ingredients: { unit_cost: number } }
type Recipe = { yield: number; recipe_ingredients: RecipeIngredient[] }
type ProductWithRecipes = { price: number; name: string; recipes: Recipe[] }

function calculateProductCost(product: ProductWithRecipes): number {
  if (!product.recipes || product.recipes.length === 0) return 0
  const recipe = product.recipes[0]
  const totalCost = recipe.recipe_ingredients.reduce((acc, ri) => {
    return acc + ri.ingredients.unit_cost * ri.quantity
  }, 0)
  return totalCost / recipe.yield
}

export async function getDashboardStats() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const currentMonth = now.getMonth()

  const [
    ordersResult,
    expensesResult,
    productsResult,
    dailySalesResult,
    openOrdersResult,
    orderItemsResult,
  ] = await Promise.all([
    supabase.from('orders').select('total, created_at').eq('tenant_id', tenantId),
    supabase.from('expenses').select('amount, date, category').eq('tenant_id', tenantId),
    supabase
      .from('products')
      .select('price, name, recipes(yield, recipe_ingredients(quantity, ingredients(unit_cost)))')
      .eq('tenant_id', tenantId),
    supabase
      .from('orders')
      .select('total')
      .gte('created_at', startOfToday.toISOString())
      .eq('tenant_id', tenantId),
    supabase
      .from('orders')
      .select('id')
      .in('status', ['Pendente', 'Processando'])
      .eq('tenant_id', tenantId),
    supabase
      .from('order_items')
      .select('quantity, products(name)')
      .eq('tenant_id', tenantId)
      .limit(1000),
  ])

  if (ordersResult.error) throw ordersResult.error
  if (expensesResult.error) throw expensesResult.error
  if (productsResult.error) throw productsResult.error
  if (dailySalesResult.error) throw dailySalesResult.error
  if (openOrdersResult.error) throw openOrdersResult.error
  if (orderItemsResult.error) throw orderItemsResult.error

  const orders = ordersResult.data
  const expenses = expensesResult.data
  const products = productsResult.data as ProductWithRecipes[]

  const monthlyRevenue = orders
    .filter(o => new Date(o.created_at).getMonth() === currentMonth)
    .reduce((acc, o) => acc + o.total, 0)

  const monthlyExpenses = expenses
    .filter(e => new Date(e.date).getMonth() === currentMonth)
    .reduce((acc, e) => acc + e.amount, 0)

  const monthlyProfit = monthlyRevenue - monthlyExpenses

  const totalMargin = products.reduce((acc, product) => {
    const cost = calculateProductCost(product)
    if (cost === 0) return acc
    return acc + ((product.price - cost) / product.price) * 100
  }, 0)
  const averageMargin = products.length > 0 ? totalMargin / products.length : 0

  const topProfitableProducts = products
    .map(product => {
      const cost = calculateProductCost(product)
      return { name: product.name, Lucro: product.price - cost }
    })
    .sort((a, b) => b.Lucro - a.Lucro)
    .slice(0, 5)

  const expensesByCategoryData = expenses.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = 0
    acc[e.category] += e.amount
    return acc
  }, {} as Record<string, number>)

  const expensesByCategoryChartData = Object.entries(expensesByCategoryData).map(
    ([name, value]) => ({ name, value })
  )

  const orderItems = orderItemsResult.data
  const productSales = orderItems.reduce((acc, item) => {
    const prods = item.products
    if (prods && Array.isArray(prods) && prods.length > 0) {
      const productName = prods[0].name
      if (productName) {
        if (!acc[productName]) acc[productName] = 0
        acc[productName] += item.quantity
      }
    }
    return acc
  }, {} as Record<string, number>)

  const topSellingProduct =
    Object.entries(productSales)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)[0] ?? { name: 'N/A', count: 0 }

  return {
    dailySales: {
      total: dailySalesResult.data.reduce((acc, o) => acc + o.total, 0),
    },
    openOrders: {
      count: openOrdersResult.data.length,
    },
    topSellingProduct,
    monthlyProfit,
    averageMargin,
    topProfitableProducts,
    expensesByCategoryChartData,
  }
}

export async function getSalesChartData() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total')
    .gte('created_at', sevenDaysAgo.toISOString())
    .eq('tenant_id', tenantId)

  if (error) throw error

  const salesData = data.reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString('pt-BR', { weekday: 'short' })
    if (!acc[date]) acc[date] = { total: 0 }
    acc[date].total += order.total
    return acc
  }, {} as Record<string, { total: number }>)

  return Object.entries(salesData).map(([date, { total }]) => ({
    name: date,
    vendas: total,
  }))
}

export async function getTopProductsChartData() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data, error } = await supabase
    .from('order_items')
    .select('quantity, products(name)')
    .eq('tenant_id', tenantId)
    .limit(1000)

  if (error) throw error

  const productSales = data.reduce((acc, item) => {
    const prods = item.products
    if (prods && Array.isArray(prods) && prods.length > 0) {
      const productName = prods[0].name
      if (productName) {
        if (!acc[productName]) acc[productName] = 0
        acc[productName] += item.quantity
      }
    }
    return acc
  }, {} as Record<string, number>)

  return Object.entries(productSales)
    .map(([name, vendidos]) => ({ name, vendidos }))
    .sort((a, b) => b.vendidos - a.vendidos)
    .slice(0, 5)
}
