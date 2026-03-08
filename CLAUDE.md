# Confeitaria Dashboard — CLAUDE.md

## Contexto

Dashboard de gestão para confeitaria artesanal: pedidos, clientes, produtos, receitas, ingredientes, despesas e fluxo financeiro. Next.js App Router + Supabase.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15.5.4 (App Router) + React 19 |
| Backend/DB | Supabase (PostgreSQL + Auth SSR) |
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

## Variáveis de Ambiente

Criar `.env.local` na raiz:
```
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Estrutura

```
app/
  layout.tsx / page.tsx
  dashboard/
    page.tsx + clientes/ pedidos/ produtos/ ingredientes/
    receitas/ despesas/ entradas/ saidas/ financeiro/
  actions/          # Server Actions (customers, products, orders,
                    #   expenses, revenues, recipes, ingredients,
                    #   transactions, ingredient-purchases)
components/
  ui/               # shadcn primitives
  charts/           # SalesChart, TopProductsChart
  dialogs/          # Modais CRUD
  forms/            # react-hook-form + Zod
  Sidebar.tsx / KpiCard.tsx / EmptyState.tsx / StockAlertBanner.tsx
hooks/              # useQuery + mutations por entidade
lib/
  supabase/client.ts / server.ts
  validations/      # Schemas Zod (*.schema.ts)
  utils/            # Utilitários puros (recipe-cost.ts, stock-alert.ts)
middleware.ts       # Protege /dashboard/*
__tests__/
  mocks/supabase.ts
  unit/actions/ hooks/ utils/ validations/
vitest.config.ts / vitest.setup.ts
```

## Entidades

| Entidade | Campos principais |
|----------|------------------|
| Clientes | nome, email, phone, is_vip |
| Pedidos | customer_id, items, total, status |
| Produtos | nome, categoria, preco, custo, estoque, min_stock |
| Ingredientes | nome, unidade, unit_cost, current_stock, min_stock, supplier |
| Compras de Ingredientes | ingredient_id, quantity, unit_cost, total_cost, date |
| Receitas | product_id, yield, prep_time, ingredientes + quantidades |
| Despesas | descricao, montante, categoria, data |
| Receitas Financeiras | descricao, quantidade, unit_price, total, data |

## Padrões Arquiteturais

**Data flow leitura:** `useQuery` (client) → Supabase SELECT → cache React Query

**Data flow mutação:** Form → Server Action (FormData) → Zod → Supabase INSERT/UPDATE/DELETE → `revalidatePath()` → `invalidateQueries()`

**Páginas dashboard:** todas `'use client'`, dados via hooks, mutações via Server Actions.

**Autenticação:** `middleware.ts` protege `/dashboard/*`, Supabase SSR com cookies.

### Regras Obrigatórias

1. `cookies()` só dentro de async function
2. Zod antes de qualquer INSERT/UPDATE
3. `revalidatePath('/dashboard')` após toda mutação server-side
4. `invalidateQueries()` no `onSuccess` dos hooks
5. Estado de dialog local: `[open, setOpen] = useState(false)`
6. Toast via `sonner` para feedback ao usuário

### Nomenclatura

- Hooks: `useEntity` (useProducts, useCustomers)
- Actions: `verboEntidade` (createProduct, updateOrder)
- Arquivos: camelCase (hooks/utils), PascalCase (componentes)
- Schemas: `lib/validations/*.schema.ts`
- Utils puros: `lib/utils/*.ts`

## TDD — Fluxo de Trabalho

Todo código novo segue ciclo **Red → Green → Refactor**:

1. Escreva os testes primeiro (falham)
2. Implemente o mínimo para passar
3. Refatore sem quebrar

### Estrutura de testes

```
__tests__/unit/
  validations/  # Schemas Zod: campos, tipos, edge cases
  utils/        # Funções puras: cálculos, transformações
  actions/      # Server actions: retorno, erros Supabase, validação
  hooks/        # Estado loading/success/error, invalidação de cache
```

Mock centralizado do Supabase em `__tests__/mocks/supabase.ts` com padrão `vi.hoisted`.

## Status de Implementação

### ✅ Completo
- CRUD completo: 8 entidades + histórico de compras de ingredientes
- Order-customer relationships
- Engine de cálculo de custo de receita (`lib/utils/recipe-cost.ts`)
- Alertas de estoque baixo (`lib/utils/stock-alert.ts` + `hooks/useStockAlerts.ts` + `components/StockAlertBanner.tsx`)
  - Ingredientes: threshold via quantidade usada em receitas; fallback para `min_stock`
  - Produtos: threshold via `min_stock`
- Autenticação SSR + middleware
- 10 páginas dashboard
- KPI cards + charts (SalesChart, TopProductsChart)
- Infraestrutura de testes Vitest — TDD estabelecido

### ❌ TODO (Fase 2)
- Analytics avançada (trends, previsões, sazonalidade)
- Sistema de metas e objetivos
- Notas em pedidos/produtos/despesas/clientes
- Tags (produtos, clientes, despesas)
- Calendário de entregas
- Dashboard executivo / comparações com mês anterior

## Problemas Conhecidos

| Problema | Detalhe |
|----------|---------|
| Build falha | Falta `.env.local` — criar conforme seção acima |
| Lint: `no-explicit-any` | `hooks/useDashboardStats.ts` linhas ~31,36,52,60 |
| Lint: `no-require-imports` | `tailwind.config.ts` — esperado para Tailwind v4 |
| Lint: `no-unused-vars` | `hooks/useTransactions.ts`, `app/actions/revenues.ts` |
| TypeScript | ✅ sem erros |

## Git & Versionamento

### Branches

- `main` — sempre estável, nunca commitar direto para features
- `feat/<desc>` — novas funcionalidades
- `fix/<desc>` — correções
- `chore/<desc>` — manutenção, deps, configs
- `docs/<desc>` — documentação
- `claude/<desc>-<id>` — branches de sessões Claude Code (automático)

### Commits (Conventional Commits em português)

```
feat(pedidos): adiciona filtro por status na listagem
fix(lint): substitui any por tipos em useDashboardStats
test(receitas): adiciona testes TDD para cálculo de custo
docs: compacta CLAUDE.md com fluxo atual
```

Tipos: `feat` | `fix` | `docs` | `test` | `refactor` | `chore` | `style`

### Regras

1. `yarn lint` e `yarn test` antes de commitar
2. Nunca commitar `.env.local`
3. Commits atômicos — uma mudança lógica por commit
4. Nunca `--force` na `main`, nunca `--no-verify`

## Troubleshooting

| Erro | Solução |
|------|---------|
| "cookies outside request scope" | Mover `cookies()` para dentro da async function |
| "NEXT_PUBLIC_SUPABASE_URL not found" | Criar `.env.local` |
| Build falha silenciosamente | `yarn tsc --noEmit` para ver detalhes |
| Dados não atualizam | Adicionar `invalidateQueries()` no `onSuccess` |
