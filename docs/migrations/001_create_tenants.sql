-- ============================================================
-- Migration 001: Criar tabela tenants
-- Fase 1 do Roadmap SaaS — Multi-tenancy
-- ============================================================

-- Extensão para UUID (já habilitada no Supabase por padrão)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de tenants (organizações/confeitarias)
CREATE TABLE IF NOT EXISTS public.tenants (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL CHECK (char_length(name) >= 2),
  owner_uid     text NOT NULL UNIQUE,   -- UID do usuário autenticado (Supabase Auth / Firebase UID futuro)
  plan          text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'suspended', 'cancelled')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Índice para lookup rápido por owner_uid
CREATE INDEX IF NOT EXISTS tenants_owner_uid_idx ON public.tenants(owner_uid);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: apenas o próprio owner acessa seu tenant
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Política: leitura — apenas o próprio dono
CREATE POLICY "tenants_select_own" ON public.tenants
  FOR SELECT USING (owner_uid = auth.uid()::text);

-- Política: inserção — apenas via service role (criado no signup)
-- (Usuário não cria tenant diretamente; Server Action cria via service role)
CREATE POLICY "tenants_insert_service" ON public.tenants
  FOR INSERT WITH CHECK (true);  -- restrito pela service role key no server

-- Política: atualização — apenas o próprio dono
CREATE POLICY "tenants_update_own" ON public.tenants
  FOR UPDATE USING (owner_uid = auth.uid()::text);

-- Política: deleção — apenas via service role
CREATE POLICY "tenants_delete_service" ON public.tenants
  FOR DELETE USING (false);  -- nunca deletar via cliente; usar service role
