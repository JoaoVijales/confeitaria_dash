import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cria cliente Supabase server-side com service role key.
 *
 * LIMITAÇÃO CONHECIDA (SEC-2): service_role bypassa RLS por design do Supabase.
 * Isso é necessário porque o projeto usa Firebase Auth (não Supabase Auth),
 * e o Supabase não consegue verificar JWTs do Firebase nativamente.
 *
 * Isolamento de tenants é garantido por:
 * 1. getTenantId() — valida sessão Firebase antes de qualquer query
 * 2. .eq('tenant_id', tenantId) obrigatório em toda query de dados
 * 3. Testes em __tests__/unit/security/tenant-isolation.test.ts
 *
 * Para habilitar RLS nativo: migrar autenticação para Supabase Auth
 * ou implementar JWT customizado compatível com as RLS policies.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
