import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: orders, error: ordersError } = await supabase.from('orders').select('total, created_at')
      if (ordersError) throw ordersError

      const { data: expenses, error: expensesError } = await supabase.from('expenses').select('amount, date, category')
      if (expensesError) throw expensesError

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          price,
          name,
          recipes (
            yield,
            recipe_ingredients (
              quantity,
              ingredients (unit_cost)
            )
          )
        `)
      if (productsError) throw productsError

      type RecipeIngredient = { quantity: number; ingredients: { unit_cost: number } }
      type Recipe = { yield: number; recipe_ingredients: RecipeIngredient[] }
      type ProductWithRecipes = { price: number; name: string; recipes: Recipe[] }

      const calculateCost = (product: ProductWithRecipes) => {
        if (!product.recipes || product.recipes.length === 0) {
          return 0
        }
        const recipe = product.recipes[0]
        const totalCost = recipe.recipe_ingredients.reduce((acc: number, ri: RecipeIngredient) => {
          return acc + (ri.ingredients.unit_cost * ri.quantity)
        }, 0)
        return totalCost / recipe.yield
      }

      const monthlyRevenue = orders
        .filter(order => new Date(order.created_at).getMonth() === new Date().getMonth())
        .reduce((acc, order) => acc + order.total, 0)

      const monthlyExpenses = expenses
        .filter(expense => new Date(expense.date).getMonth() === new Date().getMonth())
        .reduce((acc, expense) => acc + expense.amount, 0)

      const monthlyProfit = monthlyRevenue - monthlyExpenses

      const totalMargin = (products as ProductWithRecipes[]).reduce((acc: number, product: ProductWithRecipes) => {
        const cost = calculateCost(product)
        if (cost === 0) return acc
        return acc + ((product.price - cost) / product.price) * 100
      }, 0)
      const averageMargin = totalMargin / products.length

      const topProfitableProducts = products
        .map((product: ProductWithRecipes) => {
          const cost = calculateCost(product)
          const profit = product.price - cost
          return { name: product.name, Lucro: profit }
        })
        .sort((a, b) => b.Lucro - a.Lucro)
        .slice(0, 5)

      const expensesByCategoryData = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0
        }
        acc[expense.category] += expense.amount
        return acc
      }, {} as Record<string, number>)

      const expensesByCategoryChartData = Object.entries(expensesByCategoryData).map(([name, value]) => ({ name, value }))

      const { data: dailySales, error: dailySalesError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

      if (dailySalesError) throw dailySalesError

      const { data: openOrders, error: openOrdersError } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['Pendente', 'Processando'])

      if (openOrdersError) throw openOrdersError

      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('quantity, products (name)')
        .limit(1000) // Adjust limit as needed

      if (orderItemsError) throw orderItemsError

      const productSales = orderItems.reduce((acc, item) => {
        if (item.products && Array.isArray(item.products) && item.products.length > 0) {
          const productName = item.products[0].name;
          if (productName) {
            if (!acc[productName]) {
              acc[productName] = 0;
            }
            acc[productName] += item.quantity;
          }
        }
        return acc;
      }, {} as Record<string, number>);

      const topSellingProduct = Object.entries(productSales)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)[0] || { name: 'N/A', count: 0 };

      return {
        dailySales: {
          total: dailySales.reduce((acc, order) => acc + order.total, 0),
        },
        openOrders: {
          count: openOrders.length,
        },
        topSellingProduct,
        monthlyProfit,
        averageMargin,
        topProfitableProducts,
        expensesByCategoryChartData,
      }
    },
  })
}
