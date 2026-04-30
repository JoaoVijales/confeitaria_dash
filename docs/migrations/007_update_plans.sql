-- ============================================================
-- Migration 007: Atualizar planos SaaS
-- Remove plano gratuito — adiciona plano max.
-- Usuários free existentes são bloqueados (status = 'cancelled').
-- ============================================================

-- 1. Remover CHECK constraint antiga do plano
ALTER TABLE public.tenants
  DROP CONSTRAINT IF EXISTS tenants_plan_check;

-- 2. Adicionar nova CHECK constraint incluindo 'max'
ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_plan_check
    CHECK (plan IN ('free', 'basic', 'pro', 'max'));

-- 'free' permanece válido como estado interno de acesso bloqueado.

-- 3. Atualizar CHECK constraint de status para incluir 'cancelled'
ALTER TABLE public.tenants
  DROP CONSTRAINT IF EXISTS tenants_status_check;

ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_status_check
    CHECK (status IN ('active', 'past_due', 'suspended', 'cancelled'));

-- 4. Bloquear todos os tenants com plano 'free' —
--    eles precisam assinar um plano pago para continuar.
UPDATE public.tenants
  SET status = 'cancelled'
  WHERE plan = 'free';
