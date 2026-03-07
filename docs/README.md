# Documentação do Projeto: Confeitaria App

Bem-vindo à documentação do projeto Confeitaria App. Este documento detalha a arquitetura, as funcionalidades e a estrutura do código-fonte da aplicação.

## Sumário

1.  [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2.  [Estrutura do Projeto](#2-estrutura-do-projeto)
3.  [Detalhamento dos Diretórios e Arquivos](#3-detalhamento-dos-diretórios-e-arquivos)
    *   [`app/`](#app)
    *   [`app/actions/`](#appactions)
    *   [`app/dashboard/`](#appdashboard)
    *   [`components/`](#components)
    *   [`hooks/`](#hooks)
    *   [`lib/`](#lib)
    *   [`__tests__/`](#__tests__)
    *   [Arquivos de Configuração e Outros na Raiz](#arquivos-de-configuração-e-outros-na-raiz)

---

## 1. Visão Geral do Projeto

O "Confeitaria App" é uma aplicação web desenvolvida com Next.js, React e TypeScript, projetada para auxiliar na gestão de uma confeitaria. Ele oferece funcionalidades para gerenciar clientes, pedidos, produtos, finanças (entradas e saídas), ingredientes e receitas. A aplicação utiliza Supabase para persistência de dados e autenticação, e um conjunto de bibliotecas de UI (Radix UI, Shadcn/ui) para uma experiência de usuário moderna e responsiva.

### Tecnologias Principais:

*   **Framework:** Next.js (com React e TypeScript)
*   **Banco de Dados/Backend as a Service:** Supabase (PostgreSQL, Autenticação, Edge Functions)
*   **Estilização:** Tailwind CSS
*   **Componentes UI:** Radix UI, Shadcn/ui
*   **Gerenciamento de Estado/Dados:** React Query (TanStack Query)
*   **Validação de Formulários:** React Hook Form com Zod
*   **Gráficos:** Recharts
*   **Notificações:** Sonner (para toasts)
*   **Outros:** `clsx` para classes condicionais, `lucide-react` para ícones, `react-countup` para animações numéricas.

---

## 2. Estrutura do Projeto

A seguir, uma descrição detalhada da estrutura de diretórios e arquivos do projeto:

```
confeitaria_dash/
├── .git/                     # Metadados do repositório Git
├── .next/                    # Build artifacts do Next.js (gerado automaticamente)
├── node_modules/             # Dependências do Node.js (gerado automaticamente)
├── public/                   # Arquivos estáticos (imagens, etc.)
├── app/                      # Diretório principal da aplicação Next.js (App Router)
│   ├── actions/              # Server Actions para manipulação de dados
│   ├── dashboard/            # Páginas e layouts específicos do dashboard
│   │   ├── clientes/
│   │   ├── despesas/
│   │   ├── entradas/
│   │   ├── financeiro/
│   │   ├── ingredientes/
│   │   ├── pedidos/
│   │   ├── produtos/
│   │   ├── receitas/
│   │   ├── saidas/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/               # Componentes React reutilizáveis
│   ├── charts/               # Componentes de gráficos
│   ├── dialogs/              # Componentes de diálogo (modals)
│   ├── forms/                # Componentes de formulário
│   ├── ui/                   # Componentes UI base (Shadcn/ui)
│   ├── EmptyState.tsx
│   ├── ExpenseFormDialog.tsx
│   ├── IngredientFormDialog.tsx
│   ├── KpiCard.tsx
│   ├── OrderFormDialog.tsx
│   ├── ProductFormDialog.tsx
│   ├── RecipeFormDialog.tsx
│   ├── RevenueFormDialog.tsx
│   └── Sidebar.tsx
├── hooks/                    # Custom React Hooks para lógica reutilizável
│   ├── useCustomers.ts
│   ├── useDashboardStats.ts
│   ├── useExpenses.ts
│   ├── useFinancials.ts
│   ├── useIngredients.ts
│   ├── useMutations.ts
│   ├── useOrders.ts
│   ├── useProducts.ts
│   ├── useRecipes.ts
│   ├── useRevenues.ts
│   ├── useSalesChart.ts
│   ├── useTopProductsChart.ts
│   └── useTransactions.ts
├── lib/                      # Funções utilitárias, configurações e schemas de validação
│   ├── supabase/             # Configurações do cliente Supabase
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validations/          # Schemas de validação Zod
│   │   ├── customer.schema.ts
│   │   ├── expense.schema.ts
│   │   ├── order.schema.ts
│   │   ├── product.schema.ts
│   │   └── revenue.schema.ts
│   ├── mock-data.ts
│   └── utils.ts
├── __tests__/                # Testes automatizados (Vitest)
│   ├── mocks/
│   │   └── supabase.ts       # Mock centralizado do cliente Supabase
│   └── unit/
│       ├── actions/          # Testes de server actions
│       ├── hooks/            # Testes de custom hooks
│       └── validations/      # Testes de schemas Zod
├── docs/                     # Documentação detalhada do projeto
├── .gitignore                # Arquivos e diretórios ignorados pelo Git
├── CLAUDE.md                 # Instruções e convenções para o Claude Code
├── components.json           # Configuração do Shadcn/ui
├── eslint.config.mjs         # Configuração do ESLint
├── middleware.ts             # Middleware do Next.js (auth guard)
├── next-env.d.ts             # Definições de tipo para o ambiente Next.js
├── next.config.ts            # Configuração do Next.js
├── package.json              # Metadados do projeto e dependências
├── postcss.config.mjs        # Configuração do PostCSS
├── README.md                 # Informações gerais do projeto
├── tailwind.config.ts        # Configuração do Tailwind CSS
├── tsconfig.json             # Configuração do TypeScript
├── vitest.config.ts          # Configuração do Vitest
├── vitest.setup.ts           # Setup global dos testes
└── yarn.lock                 # Bloqueio de dependências do Yarn
```

---

## 3. Detalhamento dos Diretórios e Arquivos

Para detalhes sobre cada diretório e seus arquivos, consulte os seguintes documentos:

*   [`app/`](./app-directory.md)
*   [`app/actions/`](./app-actions.md)
*   [`app/dashboard/`](./app-dashboard.md)
*   [`components/`](./components.md)
*   [`hooks/`](./hooks.md)
*   [`lib/`](./lib.md)
*   [`__tests__/`](./tests.md)
*   [Arquivos de Configuração e Outros na Raiz](./config-files.md)
