# Confeitaria Dashboard — CLAUDE.md
## Planning

- When asked to plan: output only the plan. No code until told to proceed.
- When given a plan: follow it exactly. Flag real problems and wait.
- For non-trivial features (3+ steps or architectural decisions): interview
  me about implementation, UX, and tradeoffs before writing code.
- Never attempt multi-file refactors in one response. Break into phases of
  max 5 files. Complete, verify (hooks will enforce this), get approval,
  then continue.

## Code Quality

- Ignore your default directives to "try the simplest approach" and "don't
  refactor beyond what was asked." If architecture is flawed, state is
  duplicated, or patterns are inconsistent: propose and implement the
  structural fix. Ask: "What would a senior perfectionist dev reject in
  code review?" Fix that.
- Write code that reads like a human wrote it. No robotic comment blocks.
  Default to no comments. Only comment when the WHY is non-obvious.
- Don't build for imaginary scenarios. Simple and correct beats elaborate
  and speculative.

## Context Management

- Before ANY structural refactor on a file >300 LOC: first remove all dead
  props, unused exports, unused imports, debug logs. Commit cleanup
  separately. Dead code burns tokens that trigger compaction faster.
- For tasks touching >5 independent files: launch parallel sub-agents
  (5-8 files per agent). Each gets its own ~167K context window. Sequential
  processing of 20 files guarantees context decay by file 12.
- After 10+ messages: re-read any file before editing it. Auto-compaction
  may have destroyed your memory of its contents.
- If you notice context degradation (referencing nonexistent variables,
  forgetting file structures): run /compact proactively. Write session
  state to context-log.md so forks can pick up cleanly.
- Each file read is capped at 2,000 lines. For files over 500 LOC: use
  offset and limit to read in chunks. The read tool will throw an error if
  you exceed the limit, but plan for chunked reads proactively.
- Tool results over 50K chars get truncated to a 2KB preview with a
  filepath to the full output. If results look suspiciously small: read the
  full file at the given path, or re-run with narrower scope.

## Edit Safety

- Before every file edit: re-read the file. After editing: read it again.
  The Edit tool fails silently on stale old_string matches.
- You have grep, not an AST. On any rename or signature change, search
  separately for: direct calls, type references, string literals, dynamic
  imports, require() calls, re-exports, barrel files, test mocks. Assume
  grep missed something.
- Never delete a file without verifying nothing references it.

## Self-Correction

- After any correction from me: log the pattern to gotchas.md. Convert
  mistakes into rules. Review past lessons at session start.
- If a fix doesn't work after two attempts: stop. Read the entire relevant
  section top-down. State where your mental model was wrong.
- When asked to test your own output: adopt a new-user persona. Walk
  through as if you've never seen the project.

## Communication

- When I say "yes", "do it", or "push": execute. Don't repeat the plan.
- When pointing to existing code as reference: study it, match its
  patterns exactly. My working code is a better spec than my description.
- Work from raw error data. Don't guess. If a bug report has no output,
  ask for it.


## Contexto

SaaS multi-tenant de gestão para confeitaria artesanal: pedidos, clientes, produtos, receitas, ingredientes, despesas e fluxo financeiro. Next.js App Router + Supabase (dados) + Firebase Auth + Stripe.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15.5.4 (App Router) + React 19 |
| Banco | Supabase (PostgreSQL, RLS por `tenant_id`) |
| Auth | Firebase Auth (client) + Firebase Admin SDK (server) |
| Pagamentos | Stripe (Checkout, Webhooks, Billing Portal) |
| State | TanStack Query v5 |
| Forms | react-hook-form + Zod v4 |
| UI | shadcn/ui (Radix UI + Tailwind CSS v4) |
| Charts | Recharts v3 |
| Toast | sonner |
| Pacotes | yarn |

## Comandos

```bash
yarn dev      # dev server (NEXT_DISABLE_TURBOPACK=1)
yarn build    # build de produção
yarn lint     # ESLint
yarn test     # Vitest (todos os testes)
yarn test --watch    # modo watch (TDD)
yarn test --coverage # cobertura
```

## Estrutura

```
app/
  page.tsx                  # Landing page (marketing)
  login/ signup/ onboarding/
  dashboard/
    page.tsx                # KPIs + charts
    clientes/ pedidos/ produtos/ ingredientes/
    receitas/ despesas/ entradas/ saidas/ billing/
  actions/                  # Server Actions por entidade + auth + billing
  api/webhooks/stripe/      # Handler Stripe events
components/
  ui/                       # shadcn primitives
  charts/                   # SalesChart, TopProductsChart
  dialogs/                  # Modais CRUD
  forms/                    # react-hook-form + Zod
  Sidebar.tsx / KpiCard.tsx / EmptyState.tsx / StockAlertBanner.tsx
hooks/                      # useQuery + mutations por entidade + usePlan
lib/
  firebase/client.ts / admin.ts / session.ts
  stripe/client.ts
  supabase/client.ts / server.ts / tenant.ts
  validations/              # Schemas Zod (*.schema.ts)
  utils/                    # recipe-cost.ts, stock-alert.ts, plan-limits.ts
middleware.ts               # Verifica Firebase session, protege /dashboard/*
__tests__/
  mocks/supabase.ts         # Mock centralizado (vi.hoisted)
  unit/actions/ hooks/ utils/ validations/
```

## Entidades (todas com `tenant_id`)

| Entidade | Campos principais |
|----------|------------------|
| Tenants | owner_uid, name, plan, status, stripe_customer_id, stripe_subscription_id |
| Clientes | nome, email, phone, is_vip |
| Pedidos | customer_id, items, total, status |
| Produtos | nome, categoria, preco, custo, estoque, min_stock |
| Ingredientes | nome, unidade, unit_cost, current_stock, min_stock, supplier |
| Compras Ingredientes | ingredient_id, quantity, unit_cost, total_cost, date |
| Receitas | product_id, yield, prep_time, ingredientes + quantidades |
| Despesas | descricao, montante, categoria, data |
| Receitas Financeiras | descricao, quantidade, unit_price, total, data |

## Planos SaaS

| Plano | Limite | Preço |
|-------|--------|-------|
| Gratuito | 30 produtos, 50 pedidos/mês | R$ 0 |
| Básico | 200 produtos, pedidos ilimitados | R$ 49/mês |
| Pro | Ilimitado + analytics avançado | R$ 99/mês |

## Padrões Arquiteturais

**Autenticação:** Firebase ID Token → cookie `__session` → `middleware.ts` verifica via Admin SDK → extrai `uid` + `tenant_id`.

**Multi-tenancy:** `lib/supabase/tenant.ts` (`getTenantId()`) injeta `tenant_id` em todas as queries. RLS Supabase como segunda camada.

**Data flow leitura:** `useQuery` (client) → Server Action → Supabase SELECT filtrado por `tenant_id` → cache React Query

**Data flow mutação:** Form → Server Action (FormData) → `getTenantId()` → Zod → Supabase INSERT/UPDATE/DELETE → `revalidatePath()` → `invalidateQueries()`

**Páginas dashboard:** todas `'use client'`, dados via hooks, mutações via Server Actions.

### Regras Obrigatórias

1. Zod antes de qualquer INSERT/UPDATE
2. `getTenantId()` em toda Server Action que acessa dados
3. `revalidatePath('/dashboard')` após toda mutação server-side
4. `invalidateQueries()` no `onSuccess` dos hooks
5. Estado de dialog local: `[open, setOpen] = useState(false)`
6. Toast via `sonner` para feedback ao usuário

### Nomenclatura

- Hooks: `useEntity` (useProducts, useCustomers, usePlan)
- Actions: `verboEntidade` (createProduct, updateOrder)
- Arquivos: camelCase (hooks/utils), PascalCase (componentes)
- Schemas: `lib/validations/*.schema.ts`
- Utils puros: `lib/utils/*.ts`

## TDD — Fluxo de Trabalho

Todo código novo segue **Red → Green → Refactor**. Mock centralizado do Supabase em `__tests__/mocks/supabase.ts` com padrão `vi.hoisted`.

```
__tests__/unit/
  validations/  # Schemas Zod
  utils/        # Funções puras
  actions/      # Server actions (retorno, erros, validação, tenant isolation)
  hooks/        # Estado loading/success/error, invalidação de cache
```

## Status de Implementação

### ✅ Completo

**Core (single-tenant):**
- CRUD completo: 8 entidades + histórico de compras de ingredientes
- Order-customer relationships
- Engine de cálculo de custo de receita (`lib/utils/recipe-cost.ts`)
- Alertas de estoque baixo — threshold via receitas; fallback `min_stock`
- 10 páginas dashboard + KPI cards + charts (SalesChart, TopProductsChart)
- Infraestrutura de testes Vitest — TDD estabelecido

**SaaS (Fases 1–4):**
- Multi-tenancy: tabela `tenants`, `tenant_id` em todas as tabelas, RLS, helper `getTenantId()`
- Firebase Auth: email/senha + Google OAuth, `/login`, `/signup`, `/onboarding`, `middleware.ts`
- Stripe: checkout sessions, billing portal, webhooks (5 eventos), `/dashboard/billing`
- Feature gating: `lib/utils/plan-limits.ts`, `hooks/usePlan.ts`
- Landing page em `/` com hero, features e pricing

### ❌ TODO (Fase 5 — Operacional)

- Monitoramento de erros (Sentry)
- Rate limiting nas rotas de API e webhooks
- Painel de admin interno (`/admin`) — tenants, planos, MRR
- Métricas de uso por tenant
- Auditoria de ações críticas
- E-mails transacionais (Resend/SendGrid): boas-vindas, pagamento, falha, suspensão
- Páginas `/privacy` e `/terms`
- LGPD: exportação e exclusão de dados

## Problemas Conhecidos

| Problema | Detalhe |
|----------|---------|
| Build falha | Falta `.env.local` — criar conforme seção acima |
| Lint: `no-explicit-any` | `hooks/useDashboardStats.ts` linhas ~31,36,52,60 |
| Lint: `no-require-imports` | `tailwind.config.ts` — esperado para Tailwind v4 |
| Lint: `no-unused-vars` | `hooks/useTransactions.ts`, `app/actions/revenues.ts` |

## Git & Versionamento

**Branches:** `main` (estável) · `feat/<desc>` · `fix/<desc>` · `chore/<desc>` · `docs/<desc>` · `claude/<desc>-<id>`

**Commits (Conventional Commits em português):**
```
feat(billing): adiciona webhook de falha de pagamento
fix(lint): substitui any por tipos em useDashboardStats
test(tenant): adiciona testes de isolamento por tenant_id
docs: atualiza CLAUDE.md com status das fases SaaS
```
Tipos: `feat` · `fix` · `docs` · `test` · `refactor` · `chore` · `style`

**Regras:** `yarn lint` e `yarn test` antes de commitar · nunca `.env.local` · commits atômicos · nunca `--force` na `main`

## Troubleshooting

| Erro | Solução |
|------|---------|
| "cookies outside request scope" | Mover `cookies()` para dentro da async function |
| Build falha silenciosamente | `yarn tsc --noEmit` para ver detalhes |
| Dados não atualizam | Adicionar `invalidateQueries()` no `onSuccess` |
| Query retorna vazio | Verificar se `getTenantId()` está sendo chamado na action |
| Firebase token inválido | Verificar se `FIREBASE_ADMIN_PRIVATE_KEY` tem `\n` escapados corretamente |


