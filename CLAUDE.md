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

---

## Roadmap SaaS — Próximos Passos

> Objetivo: transformar o dashboard single-tenant em um SaaS multi-tenant com autenticação Firebase e pagamentos Stripe.

### Decisões de Arquitetura

| Camada | Atual | SaaS |
|--------|-------|------|
| Auth | Supabase Auth | **Firebase Auth** (JWT → Admin SDK no server) |
| Pagamentos | — | **Stripe** (Checkout + Webhooks + Billing Portal) |
| Banco | Supabase (sem isolamento) | Supabase + **RLS por `tenant_id`** |
| Rota `/` | Tela de login | **Landing page** (marketing) |

---

### Fase 1 — Multi-tenancy no Banco (Supabase)

**Objetivo:** isolar dados por organização/cliente do SaaS.

- [ ] Criar tabela `tenants` (`id`, `name`, `owner_uid` (Firebase UID), `plan`, `stripe_customer_id`, `stripe_subscription_id`, `status`, `created_at`)
- [ ] Adicionar coluna `tenant_id uuid NOT NULL` em todas as tabelas de dados (customers, products, orders, ingredients, recipes, expenses, revenues, transactions, ingredient_purchases)
- [ ] Criar políticas RLS no Supabase para cada tabela: `USING (tenant_id = current_setting('app.tenant_id')::uuid)`
- [ ] Atualizar todas as Server Actions para incluir `tenant_id` em SELECT/INSERT/UPDATE/DELETE
- [ ] Criar helper `lib/supabase/tenant.ts` que injeta o `tenant_id` do contexto da sessão em cada query

**Testes:** unit tests para confirmar que queries sem `tenant_id` retornam vazio.

---

### Fase 2 — Autenticação Firebase

**Objetivo:** substituir Supabase Auth por Firebase Auth, mantendo Supabase apenas como banco de dados.

#### Setup
- [ ] Instalar `firebase` (client) e `firebase-admin` (server)
- [ ] Criar `lib/firebase/client.ts` — inicializa Firebase App + Auth
- [ ] Criar `lib/firebase/admin.ts` — inicializa Admin SDK com service account
- [ ] Adicionar variáveis de ambiente (ver seção abaixo)

#### Autenticação
- [ ] Criar `/login` (email/senha + Google OAuth via `signInWithPopup`)
- [ ] Criar `/signup` (registro + cria tenant no Supabase via Server Action)
- [ ] Remover Supabase Auth do `middleware.ts` → verificar Firebase ID Token via `admin.auth().verifyIdToken()`
- [ ] Armazenar session cookie (`__session`) com token Firebase após login
- [ ] Atualizar `middleware.ts`: decodificar `__session`, extrair `uid` e `tenant_id`, redirecionar para `/login` se inválido

#### Onboarding
- [ ] Criar `/onboarding` — primeira tela após signup: pede nome da confeitaria, cria registro em `tenants`
- [ ] Redirecionar para `/onboarding` se usuário autenticado mas sem `tenant`

#### Remoção do Supabase Auth
- [ ] Remover `@supabase/ssr`, `createServerClient` e `supabase.auth.*` de todo o codebase
- [ ] Manter apenas `@supabase/supabase-js` para queries de dados
- [ ] Atualizar `lib/supabase/server.ts` para usar service role key (sem auth SSR)

**Variáveis de ambiente adicionais:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

---

### Fase 3 — Pagamentos Stripe

**Objetivo:** monetizar com planos de assinatura recorrentes.

#### Planos sugeridos
| Plano | Limite | Preço |
|-------|--------|-------|
| Gratuito | 30 produtos, 50 pedidos/mês | R$ 0 |
| Básico | 200 produtos, pedidos ilimitados | R$ 49/mês |
| Pro | Ilimitado + analytics avançado | R$ 99/mês |

#### Setup
- [ ] Instalar `stripe`
- [ ] Criar `lib/stripe/client.ts` — instância do Stripe SDK
- [ ] Configurar produtos e preços no Stripe Dashboard, salvar Price IDs no `.env.local`

#### Checkout
- [ ] Criar Server Action `createCheckoutSession(priceId)` → retorna URL do Stripe Checkout
- [ ] Criar `/dashboard/billing` — página de planos com botões de upgrade
- [ ] Após checkout bem-sucedido, redirecionar para `/dashboard/billing?success=true`

#### Webhooks
- [ ] Criar `/api/webhooks/stripe/route.ts` — handler de eventos:
  - `checkout.session.completed` → atualiza `tenants.stripe_customer_id`, `stripe_subscription_id`, `plan`, `status = active`
  - `invoice.payment_succeeded` → confirma renovação
  - `invoice.payment_failed` → seta `status = past_due`, notifica usuário
  - `customer.subscription.updated` → sincroniza plano
  - `customer.subscription.deleted` → reverte para plano gratuito
- [ ] Validar assinatura do webhook com `stripe.webhooks.constructEvent()`

#### Portal do cliente
- [ ] Server Action `createBillingPortalSession()` → URL do Stripe Billing Portal (cancelar, trocar plano, atualizar cartão)

#### Feature gating
- [ ] Criar `lib/utils/plan-limits.ts` — define limites por plano
- [ ] Hook `usePlan()` — retorna plano atual e limites
- [ ] Bloquear criação quando limite atingido (ex: "Limite de produtos atingido — faça upgrade")
- [ ] Banner de trial/upgrade na Sidebar

**Variáveis de ambiente adicionais:**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_BASIC=
STRIPE_PRICE_ID_PRO=
```

---

### Fase 4 — UX SaaS

**Objetivo:** fluxo completo de um produto SaaS público.

- [ ] Landing page em `/` — hero, features, pricing, CTA, footer
- [ ] Mover login para `/login`, criar `/signup`
- [ ] Página `/dashboard/billing` com plano atual, uso, botão upgrade, portal do cliente
- [ ] Header no dashboard com: nome do tenant, plano atual, botão de logout, avatar
- [ ] Tela de trial expirado / pagamento pendente com call-to-action para billing
- [ ] E-mails transacionais (Resend ou SendGrid):
  - Boas-vindas após signup
  - Confirmação de pagamento
  - Aviso de falha no pagamento (3 dias antes de suspender)
  - Conta suspensa

---

### Fase 5 — Operacional

**Objetivo:** confiabilidade, observabilidade e escalabilidade.

- [ ] Monitoramento de erros (Sentry)
- [ ] Rate limiting nas rotas de API e webhooks
- [ ] Painel de admin interno (`/admin`) — lista tenants, status, plano, MRR
- [ ] Métricas de uso por tenant (produtos criados, pedidos/mês)
- [ ] Auditoria de ações críticas (log de delete, export de dados)
- [ ] Script de migração para adicionar `tenant_id` em dados existentes
- [ ] Política de privacidade + Termos de uso (páginas `/privacy` e `/terms`)
- [ ] LGPD: endpoint de exportação e exclusão de dados do usuário

---

### Ordem de Implementação Recomendada

```
1. Fase 1 (Multi-tenancy DB)     → fundação obrigatória, sem isso nada funciona
2. Fase 2 (Firebase Auth)        → login/logout novo, middleware, onboarding
3. Fase 4 parcial (Landing + /login + /signup)  → produto acessível publicamente
4. Fase 3 (Stripe)               → monetização
5. Fase 4 completo (Billing UX)  → experiência completa de upgrade/cancelamento
6. Fase 5 (Operacional)          → estabilidade em produção
```

---

### Stack Adicional (SaaS)

| Camada | Tecnologia |
|--------|-----------|
| Auth | Firebase Auth (client) + Firebase Admin SDK (server) |
| Pagamentos | Stripe (Checkout, Webhooks, Billing Portal) |
| E-mail | Resend (ou SendGrid) |
| Monitoramento | Sentry |
| Feature flags | Plano armazenado em `tenants.plan` no Supabase |
