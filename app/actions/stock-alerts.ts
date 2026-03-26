'use server'

import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { getLowStockIngredients, getLowStockProducts } from '@/lib/utils/stock-alert'

export async function getStockAlerts() {
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

  if (ingResult.error) throw ingResult.error
  if (prodResult.error) throw prodResult.error
  if (recResult.error) throw recResult.error

  const lowIngredients = getLowStockIngredients(ingResult.data ?? [], recResult.data ?? [])
  const lowProducts = getLowStockProducts(prodResult.data ?? [])

  return {
    lowIngredients,
    lowProducts,
    total: lowIngredients.length + lowProducts.length,
  }
}
