-- ============================================================
-- Migration 002: Adicionar tenant_id em todas as tabelas de dados
-- Fase 1 do Roadmap SaaS — Multi-tenancy
--
-- IMPORTANTE: Execute APÓS a Migration 001
-- IMPORTANTE: Execute em ambiente de desenvolvimento com dados de teste.
--             Para produção, use script de migração de dados existentes.
-- ============================================================

-- Helper: função de contexto de tenant (usada nas RLS policies)
-- O servidor injeta o tenant_id via: SET LOCAL app.tenant_id = '<uuid>'
-- As políticas RLS verificam esse valor.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid AS $$
  SELECT current_setting('app.tenant_id', true)::uuid;
$$ LANGUAGE sql STABLE;

-- ────────────────────────────────────────────────────────────
-- 1. CUSTOMERS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS customers_tenant_id_idx ON public.customers(tenant_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_tenant_isolation" ON public.customers
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 2. PRODUCTS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS products_tenant_id_idx ON public.products(tenant_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_tenant_isolation" ON public.products
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 3. ORDERS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS orders_tenant_id_idx ON public.orders(tenant_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_tenant_isolation" ON public.orders
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 4. ORDER_ITEMS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS order_items_tenant_id_idx ON public.order_items(tenant_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_tenant_isolation" ON public.order_items
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 5. INGREDIENTS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS ingredients_tenant_id_idx ON public.ingredients(tenant_id);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredients_tenant_isolation" ON public.ingredients
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 6. RECIPES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS recipes_tenant_id_idx ON public.recipes(tenant_id);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_tenant_isolation" ON public.recipes
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 7. RECIPE_INGREDIENTS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.recipe_ingredients
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS recipe_ingredients_tenant_id_idx ON public.recipe_ingredients(tenant_id);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_ingredients_tenant_isolation" ON public.recipe_ingredients
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 8. EXPENSE_ENTRIES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.expense_entries
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS expense_entries_tenant_id_idx ON public.expense_entries(tenant_id);

ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expense_entries_tenant_isolation" ON public.expense_entries
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 9. REVENUE_ENTRIES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.revenue_entries
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS revenue_entries_tenant_id_idx ON public.revenue_entries(tenant_id);

ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_entries_tenant_isolation" ON public.revenue_entries
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 10. INGREDIENT_PURCHASES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.ingredient_purchases
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS ingredient_purchases_tenant_id_idx ON public.ingredient_purchases(tenant_id);

ALTER TABLE public.ingredient_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredient_purchases_tenant_isolation" ON public.ingredient_purchases
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ────────────────────────────────────────────────────────────
-- 11. MONTHLY_CLOSURES (transações financeiras)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.monthly_closures
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS monthly_closures_tenant_id_idx ON public.monthly_closures(tenant_id);

ALTER TABLE public.monthly_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_closures_tenant_isolation" ON public.monthly_closures
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ============================================================
-- VERIFICAÇÃO DE SEGURANÇA: teste de isolamento
--
-- Execute no SQL Editor do Supabase para verificar:
--
-- 1. Sem tenant configurado no contexto → retorna vazio:
--    SELECT * FROM customers;  -- deve retornar 0 linhas
--
-- 2. Com tenant configurado → retorna apenas dados do tenant:
--    SET LOCAL app.tenant_id = '<uuid-do-tenant>';
--    SELECT * FROM customers;  -- retorna apenas dados desse tenant
--
-- 3. Tenant A não acessa dados do Tenant B:
--    SET LOCAL app.tenant_id = '<uuid-tenant-A>';
--    SELECT * FROM customers WHERE tenant_id = '<uuid-tenant-B>';
--    -- deve retornar 0 linhas (RLS bloqueia)
-- ============================================================
