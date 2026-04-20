-- ============================================================
-- Migration 005: Renomear colunas stripe_* para abacate_*
-- Resolve DATA-1: schema mismatch que quebrava o billing
--
-- IMPORTANTE: Execute APÓS as Migrations 001–004
-- ============================================================

ALTER TABLE public.tenants
  RENAME COLUMN stripe_customer_id TO abacate_customer_id;

ALTER TABLE public.tenants
  RENAME COLUMN stripe_subscription_id TO abacate_subscription_id;

-- ============================================================
-- VERIFICAÇÃO
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'tenants'
--   AND column_name IN ('abacate_customer_id', 'abacate_subscription_id');
-- -- deve retornar as 2 colunas
-- ============================================================
