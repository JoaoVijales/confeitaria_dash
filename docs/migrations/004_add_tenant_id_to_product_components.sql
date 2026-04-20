-- ============================================================
-- Migration 004: Adicionar tenant_id à tabela product_components
-- Resolve SEC-3: IDOR entre tenants na tabela product_components
--
-- IMPORTANTE: Execute APÓS as Migrations 001, 002 e 003
-- ============================================================

-- 1. Adicionar coluna tenant_id
ALTER TABLE public.product_components
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 2. Backfill via join com products (todos os componentes herdam o tenant do produto)
UPDATE public.product_components pc
SET tenant_id = p.tenant_id
FROM public.products p
WHERE pc.product_id = p.id
  AND pc.tenant_id IS NULL;

-- 3. Garantir NOT NULL após backfill
ALTER TABLE public.product_components
  ALTER COLUMN tenant_id SET NOT NULL;

-- 4. Índice para performance
CREATE INDEX IF NOT EXISTS product_components_tenant_id_idx
  ON public.product_components(tenant_id);

-- 5. Habilitar RLS
ALTER TABLE public.product_components ENABLE ROW LEVEL SECURITY;

-- 6. Policy de isolamento de tenant
CREATE POLICY "product_components_tenant_isolation" ON public.product_components
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ============================================================
-- VERIFICAÇÃO
--
-- SELECT COUNT(*) FROM product_components WHERE tenant_id IS NULL;
-- -- deve retornar 0
--
-- SET LOCAL app.tenant_id = '<uuid-tenant-A>';
-- SELECT * FROM product_components;  -- deve retornar apenas dados de A
-- ============================================================
