-- ============================================================
-- Migration 003: Políticas RLS avançadas + helper de contexto
-- Fase 1 do Roadmap SaaS — Multi-tenancy
--
-- IMPORTANTE: Execute APÓS as Migrations 001 e 002
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- HELPER: injetar tenant_id no contexto da conexão
--
-- O servidor (Server Action) chama este helper antes de qualquer query:
--   SELECT set_tenant_context('<uuid-do-tenant>');
--
-- Isso configura app.tenant_id para a sessão atual, ativando as RLS policies.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_tenant_context(p_tenant_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.tenant_id', p_tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apenas usuários autenticados podem chamar set_tenant_context
REVOKE ALL ON FUNCTION public.set_tenant_context FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_tenant_context TO authenticated;

-- ────────────────────────────────────────────────────────────
-- PROTEÇÃO EXTRA: garantir que tenant_id nunca fique NULL
-- Adiciona constraint NOT NULL após migrar dados existentes
--
-- EXECUTE APENAS APÓS rodar o script de migração de dados!
-- ────────────────────────────────────────────────────────────

-- Descomente após migrar os dados existentes:
-- ALTER TABLE public.customers         ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.products          ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.orders            ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.order_items       ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.ingredients       ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.recipes           ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.recipe_ingredients ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.expense_entries   ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.revenue_entries   ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.ingredient_purchases ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.monthly_closures  ALTER COLUMN tenant_id SET NOT NULL;

-- ────────────────────────────────────────────────────────────
-- POLÍTICA DE AUDITORIA: registrar acessos sem tenant_id
-- (Opcional - para monitorar tentativas de acesso sem contexto)
-- ────────────────────────────────────────────────────────────

-- Tabela de auditoria de violações de segurança
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id          bigserial PRIMARY KEY,
  table_name  text NOT NULL,
  operation   text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  details     jsonb
);

-- ────────────────────────────────────────────────────────────
-- SCRIPT DE MIGRAÇÃO DE DADOS EXISTENTES
-- (Para um banco com dados single-tenant existentes)
--
-- Substitua '<uuid-do-tenant-original>' pelo ID do tenant criado
-- para o usuário original do sistema.
-- ────────────────────────────────────────────────────────────

/*
-- 1. Criar o tenant para o usuário original
INSERT INTO public.tenants (name, owner_uid, plan, status)
VALUES ('Minha Confeitaria', '<uid-do-usuario-original>', 'free', 'active')
RETURNING id;

-- 2. Associar todos os dados existentes ao tenant criado
-- (Substitua '<uuid-do-tenant-criado>' pelo ID retornado acima)

UPDATE public.customers          SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.products           SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.orders             SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.order_items        SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.ingredients        SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.recipes            SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.recipe_ingredients SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.expense_entries    SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.revenue_entries    SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.ingredient_purchases SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;
UPDATE public.monthly_closures   SET tenant_id = '<uuid-do-tenant-criado>' WHERE tenant_id IS NULL;

-- 3. Verificar que nenhum dado ficou sem tenant_id
SELECT 'customers',    COUNT(*) FROM customers    WHERE tenant_id IS NULL
UNION ALL
SELECT 'products',     COUNT(*) FROM products     WHERE tenant_id IS NULL
UNION ALL
SELECT 'orders',       COUNT(*) FROM orders       WHERE tenant_id IS NULL
UNION ALL
SELECT 'ingredients',  COUNT(*) FROM ingredients  WHERE tenant_id IS NULL;
-- ... todos devem retornar 0

-- 4. Após verificar, ativar NOT NULL (Migration 003)
*/

-- ────────────────────────────────────────────────────────────
-- TESTE DE SEGURANÇA: verificar que RLS isola corretamente
-- ────────────────────────────────────────────────────────────
/*
-- Teste 1: sem contexto, não deve retornar dados
SELECT count(*) FROM customers;  -- esperado: 0

-- Teste 2: com tenant A, deve retornar apenas dados de A
SELECT set_tenant_context('<uuid-tenant-A>');
SELECT count(*) FROM customers;  -- esperado: N (dados de A)

-- Teste 3: tenant B não vê dados de A
SELECT set_tenant_context('<uuid-tenant-B>');
SELECT * FROM customers WHERE tenant_id = '<uuid-tenant-A>';  -- esperado: 0 linhas

-- Teste 4: tenant B não pode atualizar dados de A
UPDATE customers SET name = 'Hack' WHERE tenant_id = '<uuid-tenant-A>';  -- 0 rows affected
*/
