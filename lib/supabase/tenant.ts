import { getFirebaseSession } from '@/lib/firebase/session'
import { createClient } from './server'
import { logError } from '@/lib/logger'

/**
 * Retorna o tenant_id do usuário autenticado via Firebase Session.
 *
 * Segurança:
 * - Lança erro se o usuário não estiver autenticado
 * - Lança erro se o usuário não tiver um tenant cadastrado
 * - Deve ser chamado no início de toda Server Action que acessa dados
 */
export async function getTenantId(): Promise<string> {
  const session = await getFirebaseSession()

  if (!session) {
    throw new Error('Usuário não autenticado')
  }

  const supabase = createClient()
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_uid', session.uid)
    .single()

  if (tenantError || !tenant) {
    logError('Erro ao buscar tenant_id', tenantError || 'Tenant não encontrado', { 
      service: 'supabase', 
      operation: 'getTenantId',
      userId: session.uid 
    })
    throw new Error('Tenant não encontrado')
  }

  return tenant.id
}
