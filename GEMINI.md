# GEMINI.md — Instruções e Contexto do Projeto

Este arquivo serve como guia de contexto e instruções para o desenvolvimento no projeto **Confeitaria Dashboard**.

## 1. Visão Geral do Projeto
O **Confeitaria Dashboard** é um SaaS (Software as a Service) multi-tenant projetado para gestão de confeitarias artesanais. Ele centraliza o controle de pedidos, clientes, produtos, receitas, ingredientes, despesas e fluxo financeiro em uma plataforma moderna e integrada.

### Tecnologias Principais:
- **Framework:** Next.js 15.5.4 (App Router) + React 19
- **Linguagem:** TypeScript
- **Persistência de Dados:** Supabase (PostgreSQL com RLS baseado em `tenant_id`)
- **Autenticação:** Firebase Auth (Client) + Firebase Admin SDK (Server)
- **Pagamentos & Assinaturas:** Stripe (Checkout, Billing Portal, Webhooks)
- **Gerenciamento de Estado/Cache:** TanStack Query v5 (React Query)
- **Formulários & Validação:** React Hook Form + Zod
- **Estilização:** Tailwind CSS v4 + Radix UI (via shadcn/ui)
- **Gráficos:** Recharts v3
- **Testes:** Vitest

---

## 2. Comandos do Projeto

| Comando | Descrição |
| :--- | :--- |
| `yarn dev` | Inicia o servidor de desenvolvimento (sem Turbopack devido a compatibilidades) |
| `yarn build` | Gera o build de produção da aplicação |
| `yarn start` | Inicia a aplicação construída em produção |
| `yarn lint` | Executa a verificação do ESLint |
| `yarn test` | Executa todos os testes unitários com Vitest |
| `yarn test --watch` | Inicia os testes em modo de observação (TDD) |
| `yarn test --coverage` | Gera o relatório de cobertura de testes |

---

## 3. Padrões Arquiteturais e Convenções

### Multi-tenancy
O projeto é estritamente multi-tenant. Cada registro no banco de dados deve possuir um `tenant_id`.
- **Regra de Ouro:** Toda Server Action que manipula dados DEVE chamar `getTenantId()` (localizado em `lib/supabase/tenant.ts`) para garantir o isolamento dos dados.

### Fluxo de Dados
1. **Leitura:** Componente Client (`use client`) -> Custom Hook (`hooks/useEntity.ts`) -> TanStack Query (`useQuery`) -> Server Action (`app/actions/entity.ts`) -> Supabase SELECT.
2. **Escrita:** Formulário (`components/forms/`) -> Server Action (`app/actions/entity.ts`) -> Validação Zod -> Supabase INSERT/UPDATE -> `revalidatePath('/dashboard')`.
3. **Feedback:** O hook de mutação (`hooks/useMutations.ts`) deve chamar `invalidateQueries` no `onSuccess`.

### Convenções de Código:
- **Server Actions:** Devem ser assíncronas e definidas no diretório `app/actions/`. Chame `cookies()` dentro da função para evitar erros de escopo de requisição.
- **Validação:** Sempre utilize schemas Zod (`lib/validations/*.schema.ts`) antes de persistir dados.
- **UI:** Utilize componentes base do `components/ui/` (shadcn). Feedbacks ao usuário via `sonner` (toast).
- **Testes (TDD):** Prefira o fluxo Red -> Green -> Refactor. Mocks do Supabase estão centralizados em `__tests__/mocks/supabase.ts`.

### Estrutura de Diretórios Chave:
- `app/actions/`: Lógica de servidor por entidade.
- `app/dashboard/`: Páginas e layouts do painel administrativo.
- `components/dialogs/` & `components/forms/`: UI de interação e entrada de dados.
- `hooks/`: Abstração de queries e mutações (React Query).
- `lib/validations/`: Definições de contrato de dados (Zod).
- `__tests__/`: Suíte de testes unitários.

---

## 4. Variáveis de Ambiente Necessárias
Certifique-se de configurar o arquivo `.env.local` com as seguintes chaves (baseado no `.env.example`):
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`.
- Firebase: `NEXT_PUBLIC_FIREBASE_*` (Client) e `FIREBASE_ADMIN_*` (Server).
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---

## 5. Diretrizes para IAs (Gemini/Claude)
1. **Nunca esqueça do `tenant_id`:** Ao criar ou atualizar registros, certifique-se de que o `tenant_id` está presente e validado.
2. **Tratamento de Erros:** Server Actions devem retornar objetos estruturados (ex: `{ error: string }` ou `{ data: T }`) para que a UI possa reagir adequadamente.
3. **Estilo:** Siga o padrão de escrita e nomenclatura (camelCase para arquivos de lógica, PascalCase para componentes) já estabelecido.
4. **Contexto Adicional:** Para detalhes técnicos profundos sobre cada módulo, consulte os arquivos em `docs/`.
