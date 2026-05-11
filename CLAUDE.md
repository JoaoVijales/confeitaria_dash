# Confeitaria Dashboard

## Stack
Next.js 15.5.9 (App Router) · React 19 · Supabase (PostgreSQL, RLS) · Firebase Auth + Admin SDK · AbacatePay v2 · TanStack Query v5 · react-hook-form + Zod v4 · shadcn/ui · yarn

```bash
yarn dev      # NEXT_DISABLE_TURBOPACK=1
yarn test     # Vitest
yarn tsc --noEmit
```

## Padrões Obrigatórios

1. `getTenantId()` no início de toda Server Action que acessa dados
2. Zod antes de qualquer INSERT/UPDATE
3. `revalidatePath('/dashboard/...')` após toda mutação
4. `invalidateQueries()` no `onSuccess` dos hooks
5. `handleSupabaseError` lança — usar `?? []` ou `!` depois para TypeScript
6. Imports circulares entre Server Actions → dynamic import (`await import(...)`)
7. Nunca Supabase client-side direto — sempre via Server Action

## Auth & Plan Guard

**Auth:** cookie `__session` (Firebase JWT) → middleware (Edge) → Server Components via `getFirebaseSession()` → `getTenantId()`.

**Plan guard duplo:**
- Middleware lê cookie `__plan` (`plan:status`). Se `free` ou `status!='active'` → redirect billing.
- Layout faz hard check no DB via `getTenantPlan()`.
- `syncPlanCookie()` (billing.ts) mantém cookie sincronizado — chamar na billing page.

**Admin:** `role='admin'` na tabela `tenants`. `isTenantAdmin(tenantId)` sempre consulta DB — nunca cookie. Cookie para admin: `max:active` (nunca a string 'admin'). Bypass em limites pré e pós-insert.

## Custo de Produtos

`recipe-cost.ts`: `mapBaseUnit` — g→'g', kg→'kg', ml→'ml', L→'L', default→'un' (sem fallthrough). `convertToBaseUnit`: identidade quando `from === to`.

Unit em `recipe_ingredients` é travada na unit do ingrediente — sem conversão de preço entre unidades.

`recomputeAndStoreProductCost(supabase, tenantId, productId)` → chamar após `updateIngredient` e `updateRecipe`.

## Anti-Race (limites de plano)

```
pre-check → insert → post-check (se excedeu: rollback delete + throw)
```
Ambos com `!isAdmin &&`.

## AbacatePay Webhook

Payload v2 nested: `{ event, data: { subscription, customer, checkout: { metadata, items } } }`. Secret via `?webhookSecret=` com `timingSafeEqual`. Retornar 200 quando tenant não encontrado (evita loop de retentativas).

## TDD — Mocks

Mock de Server Action: `@/lib/supabase/server` + `@/lib/supabase/tenant` (incluir `getTenantId`, `getTenantPlan`, `isTenantAdmin`). Usar `mockFrom.mockImplementation((table) => ...)` para múltiplas tabelas. `vi.clearAllMocks()` não limpa `mockReturnValueOnce` pendentes — preferir `mockImplementation`.
