import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Retorna o tenant_id do usuário autenticado.
 *
 * Segurança:
 * - Lança erro se o usuário não estiver autenticado
 * - Lança erro se o usuário não tiver um tenant cadastrado
 * - Deve ser chamado no início de toda Server Action que acessa dados
 */
export async function getTenantId(supabase: SupabaseClient): Promise<string> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Usuário não autenticado')
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_uid', user.id)
    .single()

  if (tenantError || !tenant) {
    throw new Error('Tenant não encontrado')
  }

  return tenant.id
}
