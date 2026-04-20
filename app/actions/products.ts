'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'
import { ProductFormValues } from '@/lib/validations/product.schema'
import { getTenantPlan } from '@/lib/supabase/tenant'
import { isAtProductLimit } from '@/lib/utils/plan-limits'

export async function getProducts() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')
  handleSupabaseError(error, 'getProducts', { tenantId })
  return data ?? []
}

export async function getProductComponents(productId: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('product_components')
    .select('*')
    .eq('product_id', productId)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'getProductComponents', { tenantId, productId })
  return data ?? []
}

async function computeProductCost(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  components: ProductFormValues['components'],
  extraCost: number,
): Promise<number> {
  const recipeIds = components
    .filter(c => c.component_type === 'recipe' && c.recipe_id)
    .map(c => c.recipe_id!)
  const ingredientIds = components
    .filter(c => c.component_type === 'ingredient' && c.ingredient_id)
    .map(c => c.ingredient_id!)

  const recipeMap = new Map<string, number>()
  const ingMap = new Map<number, number>()

  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from('recipes')
      .select('id, yield, recipe_ingredients(quantity, ingredients(unit_cost))')
      .in('id', recipeIds)
      .eq('tenant_id', tenantId)
    for (const r of data ?? []) {
      const ris = r.recipe_ingredients as { quantity: number; ingredients: { unit_cost: number }[] }[]
      const total = ris.reduce((s, ri) => s + (ri.ingredients?.[0]?.unit_cost ?? 0) * ri.quantity, 0)
      recipeMap.set(r.id, r.yield > 0 ? total / r.yield : 0)
    }
  }

  if (ingredientIds.length > 0) {
    const { data } = await supabase
      .from('ingredients')
      .select('id, unit_cost')
      .in('id', ingredientIds)
      .eq('tenant_id', tenantId)
    for (const i of data ?? []) {
      ingMap.set(i.id, i.unit_cost)
    }
  }

  return components.reduce((total, comp) => {
    if (comp.component_type === 'recipe' && comp.recipe_id) {
      return total + (recipeMap.get(comp.recipe_id) ?? 0) * comp.quantity
    }
    if (comp.component_type === 'ingredient' && comp.ingredient_id) {
      return total + (ingMap.get(comp.ingredient_id) ?? 0) * comp.quantity
    }
    return total
  }, extraCost)
}

export async function createProduct(data: ProductFormValues) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  const plan = await getTenantPlan(tenantId)
  if (isAtProductLimit(plan, productCount ?? 0)) {
    throw new Error(`Limite de produtos atingido para o plano ${plan}`)
  }

  const cost = data.is_compound && data.components.length > 0
    ? await computeProductCost(supabase, tenantId, data.components, data.extra_cost)
    : data.cost

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name,
      category: data.category,
      price: data.price,
      cost,
      stock: data.stock,
      min_stock: data.min_stock,
      is_compound: data.is_compound,
      extra_cost: data.extra_cost,
      tenant_id: tenantId,
    })
    .select('id')
    .single()

  handleSupabaseError(error, 'createProduct', { tenantId })

  if (data.is_compound && data.components.length > 0 && product) {
    const rows = data.components.map(c => ({ ...c, product_id: product.id, tenant_id: tenantId }))
    const { error: compErr } = await supabase.from('product_components').insert(rows)
    if (compErr) {
      await supabase.from('products').delete().eq('id', product.id).eq('tenant_id', tenantId)
    }
    handleSupabaseError(compErr, 'createProduct:components', { tenantId })
  }

  revalidatePath('/dashboard/produtos')
}

export async function updateProduct(id: string, data: ProductFormValues) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const cost = data.is_compound && data.components.length > 0
    ? await computeProductCost(supabase, tenantId, data.components, data.extra_cost)
    : data.cost

  const { error } = await supabase
    .from('products')
    .update({
      name: data.name,
      category: data.category,
      price: data.price,
      cost,
      stock: data.stock,
      min_stock: data.min_stock,
      is_compound: data.is_compound,
      extra_cost: data.extra_cost,
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  handleSupabaseError(error, 'updateProduct', { tenantId, productId: id })

  const { data: existingComponents } = await supabase
    .from('product_components')
    .select('*')
    .eq('product_id', id)
    .eq('tenant_id', tenantId)

  const { error: delErr } = await supabase
    .from('product_components')
    .delete()
    .eq('product_id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(delErr, 'updateProduct:deleteComponents', { tenantId, productId: id })

  if (data.is_compound && data.components.length > 0) {
    const rows = data.components.map(c => ({ ...c, product_id: id, tenant_id: tenantId }))
    const { error: compErr } = await supabase.from('product_components').insert(rows)
    if (compErr && existingComponents?.length) {
      await supabase.from('product_components').insert(existingComponents)
    }
    handleSupabaseError(compErr, 'updateProduct:components', { tenantId, productId: id })
  }

  revalidatePath('/dashboard/produtos')
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'deleteProduct', { tenantId, productId: id })
  revalidatePath('/dashboard/produtos')
}

export async function checkLowStock() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('products')
    .select('name, stock, min_stock')
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'checkLowStock', { tenantId })
  return (data ?? []).filter(p => p.stock < p.min_stock)
}
