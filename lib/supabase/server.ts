import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cria cliente Supabase server-side com service role key.
 * Bypass de RLS — segurança garantida por tenant_id explícito nas queries
 * e pela verificação de sessão Firebase em getTenantId().
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
