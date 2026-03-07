# Confeitaria Dashboard — CLAUDE.md

## Contexto do Projeto

Dashboard de gestão para uma confeitaria artesanal. Permite controlar pedidos, clientes, produtos, receitas, ingredientes, despesas e fluxo financeiro. Aplicação web full-stack usando Next.js App Router com Supabase como backend/banco de dados.

## Stack Tecnológica

- **Framework**: Next.js 15.5.4 (App Router)
- **Runtime**: React 19
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Autenticação**: Supabase SSR Auth via middleware
- **State**: TanStack Query v5 (React Query)
- **Forms**: react-hook-form + Zod v4
- **UI**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **Charts**: Recharts v3
- **Toast**: sonner
- **Icons**: lucide-react
- **Gerenciador de pacotes**: yarn

## Comandos

```bash
yarn dev      # dev server (sem turbopack — NEXT_DISABLE_TURBOPACK=1)
yarn build    # build de produção (com turbopack)
yarn lint     # ESLint
yarn start    # produção
```

## Variaveis de Ambiente Necessarias

Criar `.env.local` na raiz com:

```
NEXT_PUBLIC_SUPABASE_URL=<url-do-projeto>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Sem essas variáveis o build e o runtime falham com erro do Supabase client.

## Estrutura de Diretórios

```
app/
  layout.tsx              # Root layout — React Query Provider
  page.tsx                # Landing / login page
  dashboard/
    page.tsx              # Dashboard principal (KPIs, charts, pedidos recentes)
    clientes/page.tsx     # Gestao de clientes
    pedidos/page.tsx      # Gestao de pedidos
    produtos/page.tsx     # Gestao de produtos + estoque
    ingredientes/page.tsx # Gestao de ingredientes + estoque
    receitas/page.tsx     # Receitas (ficha tecnica) + custo
    despesas/page.tsx     # Despesas categorisadas
    entradas/page.tsx     # Receitas financeiras
    saidas/page.tsx       # Saidas / transacoes
    financeiro/page.tsx   # Resumo financeiro mensal
  actions/                # Server Actions (FormData -> Zod -> Supabase)
    customers.ts
    products.ts
    orders.ts
    expenses.ts
    revenues.ts
    recipes.ts
    ingredients.ts
    transactions.ts
components/
  ui/                     # shadcn/ui primitives
  charts/                 # SalesChart, TopProductsChart (Recharts)
  dialogs/                # Modais CRUD (Product, Order, Customer, etc.)
  forms/                  # Formularios (react-hook-form + Zod)
  Sidebar.tsx             # Navegacao lateral
  KpiCard.tsx             # Card de KPI reutilizavel
  EmptyState.tsx          # Estado vazio reutilizavel
  RecipeFormDialog.tsx    # Dialog complexo de receitas
  IngredientFormDialog.tsx
hooks/
  useCustomers.ts         # useQuery + mutations de clientes
  useProducts.ts
  useOrders.ts
  useIngredients.ts
  useRecipes.ts
  useExpenses.ts
  useRevenues.ts
  useTransactions.ts
  useDashboardStats.ts    # Calculo de KPIs
  useSalesChart.ts
  useTopProductsChart.ts
  useFinancials.ts
  useMutations.ts         # Mutations reutilizaveis
lib/
  supabase/
    client.ts             # Supabase browser client
    server.ts             # Supabase SSR client
  validations/            # Schemas Zod por entidade
  utils.ts
  mock-data.ts
middleware.ts             # Protecao de rotas /dashboard/*
__tests__/
  mocks/
    supabase.ts           # Mock do cliente Supabase
  unit/
    actions/              # Testes de server actions
    hooks/                # Testes de custom hooks
    validations/          # Testes de schemas Zod
vitest.config.ts          # Configuracao do Vitest (jsdom + alias @/)
vitest.setup.ts           # Setup global (@testing-library/jest-dom)
```

## Entidades do Dominio

| Entidade | Campos principais |
|----------|------------------|
| Clientes | nome, email, phone, is_vip |
| Pedidos | customer_id, items, total, status (Pendente/Processando/Finalizado/Cancelado) |
| Produtos | nome, categoria, preco, custo, estoque, min_stock |
| Ingredientes | nome, unidade, unit_cost, current_stock, min_stock, supplier |
| Receitas (ficha) | product_id, yield, prep_time, ingredientes + quantidades |
| Despesas | descricao, montante, categoria, data |
| Receitas Financeiras | descricao, quantidade, unit_price, total, data |
| Transacoes | view combinada de entradas e saidas |

## Padroes Arquiteturais

### Data Flow
- **Leitura**: hook useQuery (client) -> Supabase SELECT -> cache React Query
- **Mutacao**: Form submit -> Server Action (FormData) -> validacao Zod -> Supabase INSERT/UPDATE/DELETE -> revalidatePath() -> invalidateQueries()

### Paginas do Dashboard
Todas as paginas de dashboard usam `'use client'`. Dados sao buscados via hooks customizados com React Query. Mutacoes passam por Server Actions para manter segurança server-side.

### Formularios
react-hook-form + zodResolver. Schemas de validacao em `lib/validations/`. Formularios ficam em `components/forms/` e sao usados dentro de `components/dialogs/`.

### Autenticação
Middleware em `middleware.ts` protege todas as rotas `/dashboard/*`. Usa Supabase SSR com cookies. Redireciona nao autenticados para `/`.

## Status de Implementacao

### ✅ Completo (Fase 1)
- [x] CRUD para 8 entidades (customers, products, orders, recipes, ingredients, expenses, revenues, transactions)
- [x] Autenticação Supabase SSR com middleware
- [x] 10 páginas dashboard funcionales
- [x] Validação Zod em todas entidades
- [x] React Query v5 integration
- [x] Formulários com dialogs + react-hook-form
- [x] KPI cards e charts básicos (SalesChart, TopProductsChart)
- [x] Sidebar navegação com logout
- [x] Infraestrutura de testes (Vitest + Testing Library) — 22 arquivos, 186 testes passando

### ⚠️ Parcial
- [ ] Histórico de compras de ingredientes (schema existe, CRUD base funciona)
- [ ] Triggers SQL de cálculo automático de custo (schema definido em prompt_receitas.md)
- [ ] Order-customer relationships (básico implementado)

### ❌ TODO (Fase 2 — ver prompt.md e prompt_receitas.md)
- [ ] Alertas de estoque baixo crítico
- [ ] Analytics avancada (trends, previsoes, sazonalidade)
- [ ] Sistema de metas e objetivos
- [ ] Sistema de alertas inteligentes
- [ ] Notas em pedidos/produtos/despesas/clientes
- [ ] Sistema de tags (produtos, clientes, despesas)
- [ ] Calendario de entregas
- [ ] Dashboard executivo
- [ ] Comparações inteligentes (mês anterior)

## Problemas Conhecidos

### Build & Lint (2026-03-07)
**Build**: ❌ FALHA
- Causa: Falta `.env.local` com variáveis Supabase
- Solução: Criar .env.local conforme seção "Variáveis de Ambiente Necessárias"

**Lint**: ❌ 25 ERROS + 31 WARNINGS (principais issues conhecidos)
| Arquivo | Tipo | Detalhes |
|---------|------|----------|
| `hooks/useDashboardStats.ts` | `no-explicit-any` | 4 instâncias (linhas ~31, 36, 52, 60) — tipagem complexa |
| `tailwind.config.ts` | `no-require-imports` | require() em config — esperado para Tailwind v4 |
| `hooks/useTransactions.ts` | `no-unused-vars` | variável supabase importada mas não usada |
| `app/actions/revenues.ts` | `no-unused-vars` | unit_price e total desestruturados mas não usados |

**TypeScript**: ✅ SEM ERROS

**Testes**: ✅ 22 arquivos, 186 testes passando

### Peer Dependencies
- `recharts@3.2.1` pode requerer `react-is` explícito

## Padrões & Convencoes

### Nomenclatura
- Arquivos: camelCase para hooks/utils, PascalCase para componentes
- Server Actions: verbo + entidade (createProduct, updateOrder, deleteCustomer)
- Hooks: useEntity pattern (useProducts, useCustomers)

### Data Flow Patterns

**1. Leitura (READ)**
```typescript
// Hook
const { data, isLoading } = useProducts()

// Implementação interna
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*')
      if (error) throw error
      return data
    }
  })
}
```

**2. Criação (CREATE)**
```typescript
// Componente
const mutation = useCreateProduct()
await mutation.mutateAsync(formData)

// Server Action
export async function createProduct(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const parsed = productSchema.parse(Object.fromEntries(formData.entries()))
  const { error } = await supabase.from('products').insert(parsed)
  revalidatePath('/dashboard/produtos')
}

// Hook (mutation)
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FormData) => createProduct(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  })
}
```

### Arquivos Críticos
- **Autenticação**: `middleware.ts` (protege /dashboard/*)
- **Validações**: `lib/validations/*.schema.ts`
- **Server Actions**: `app/actions/*.ts`
- **Custom Hooks**: `hooks/*.ts`
- **Componentes**: `components/` (UI + Forms + Dialogs)

### Regras Importantes

1. **Nunca use `cookies()` fora de async function** → erro "outside request scope"
2. **Sempre valide com Zod antes de INSERT/UPDATE** → segurança
3. **Chame `revalidatePath()` após toda mutação** → cache invalidation
4. **Use `queryClient.invalidateQueries()` em `onSuccess`** → UI sync
5. **Dialog state é local** → `[open, setOpen] = useState(false)`
6. **Forms devem ser reusáveis** → aceitar `onSubmit` como prop
7. **Toast notifications para user feedback** → `toast.success/error/loading`

## Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| "cookies was called outside request scope" | `cookies()` fora de async | Mover inicialização para dentro da function |
| "NEXT_PUBLIC_SUPABASE_URL not found" | .env.local falta | Criar .env.local com credenciais Supabase |
| Build falha silenciosamente | TypeScript errors | Rodar `yarn tsc --noEmit` para ver detalhes |
| Dados não atualizam | Query cache não invalidado | Adicionar `invalidateQueries()` no `onSuccess` |
| Linting errors | ESLint rules | Rodar `yarn lint` e corrigir conforme erros |

## Convencoes Estabelecidas

- **Pasta server actions**: `app/actions/` — nunca colocar lógica de negócio em componentes
- **Validação obrigatória**: Zod em TODAS server actions ANTES de chamar Supabase
- **Cache invalidation**: `revalidatePath('/dashboard')` após TODA mutação server-side
- **User feedback**: Toast via `sonner` (toast.success / toast.error)
- **Dialog patterns**: Estado local `[open, setOpen]` com `DialogTrigger`
- **Tipo de dados**: FormData para Server Actions, objetos tipados para hooks

## Git & CI/CD

### Fluxo de Branches

- `main` — branch principal, sempre estável e deployável
- `feat/<descricao>` — novas funcionalidades (ex: `feat/alertas-estoque`)
- `fix/<descricao>` — correções de bug (ex: `fix/lint-dashboard-stats`)
- `chore/<descricao>` — tarefas de manutenção, configs, deps
- `docs/<descricao>` — apenas documentação

Nunca commitar direto na `main` para features novas. Sempre abrir PR.

### Commits (Conventional Commits)

Formato: `<tipo>(<escopo opcional>): <mensagem no imperativo em português>`

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `test` | Adicionar ou corrigir testes |
| `refactor` | Refatoração sem mudar comportamento |
| `chore` | Deps, configs, build |
| `style` | Formatação, sem mudança de lógica |

Exemplos:
```
feat(pedidos): adiciona filtro por status na listagem
fix(lint): substitui any por tipos específicos em useDashboardStats
test(products): adiciona testes unitários para server actions
docs: atualiza CLAUDE.md com práticas de git
```

### Regras de Git

1. **Sempre `yarn lint` e `yarn test` antes de commitar**
2. **Nunca commitar `.env.local` ou arquivos com credenciais**
3. **Commits atômicos** — um commit por mudança lógica, não acumular tudo
4. **Mensagens descritivas** — o "porquê", não só o "o quê"
5. **Nunca usar `--force` na `main`**
6. **Nunca usar `--no-verify`** para pular hooks
7. **Rebase interativo** para limpar histórico antes de abrir PR

### CI/CD (a implementar)

Pipeline recomendado (GitHub Actions):

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  quality:
    steps:
      - yarn install
      - yarn lint          # ESLint
      - yarn tsc --noEmit  # TypeScript check
      - yarn test          # Testes automatizados
      - yarn build         # Build de produção
```

**Regras de proteção da main:**
- PR obrigatório (sem push direto)
- CI deve passar antes do merge
- Code review de pelo menos 1 pessoa

## TDD — Test-Driven Development

A partir de agora, todo código novo deve seguir o ciclo TDD:

1. **Red** — escreva o teste antes, veja falhar
2. **Green** — implemente o mínimo para passar
3. **Refactor** — limpe sem quebrar os testes

### Stack de Testes

- **Vitest** — test runner (compatível com Next.js/Vite)
- **@testing-library/react** — testes de componentes
- **@testing-library/user-event** — simulação de interações
- **msw** (Mock Service Worker) — mock de APIs/Supabase
- **@vitejs/plugin-react** — suporte JSX nos testes

### Estrutura de Testes

```
__tests__/
  mocks/
    supabase.ts       # Mock centralizado do cliente Supabase
  unit/
    actions/          # Testes de server actions (mock Supabase) — 6 arquivos
    hooks/            # Testes de custom hooks (mock queries) — 9 arquivos
    validations/      # Testes de schemas Zod — 5 arquivos
  integration/        # (futuro) componentes e forms com DOM
  e2e/                # (futuro) Playwright para fluxos críticos
```

### Comandos de Teste

```bash
yarn test           # Rodar todos os testes
yarn test --watch   # Modo watch (TDD)
yarn test --coverage # Relatório de cobertura
```

### O que testar em cada camada

| Camada | Foco dos testes |
|--------|----------------|
| `lib/validations/` | Schemas Zod: campos obrigatórios, tipos, edge cases |
| `app/actions/` | Retorno correto, erros Supabase, validação rejeitada |
| `hooks/` | Estado loading/success/error, invalidação de cache |
| `components/forms/` | Renderização, submit, mensagens de erro |
| `components/dialogs/` | Abertura/fechamento, integração com forms |
