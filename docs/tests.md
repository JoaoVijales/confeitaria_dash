## `__tests__/`

Este diretório contém todos os testes automatizados do projeto, organizados por camada. O projeto adota TDD (Test-Driven Development) a partir da Fase 2.

### Stack de Testes

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `vitest` | ^4.0 | Test runner principal (compatível com Next.js/Vite) |
| `@testing-library/react` | ^16 | Testes de componentes React |
| `@testing-library/user-event` | ^14 | Simulação de interações do usuário |
| `@testing-library/jest-dom` | ^6 | Matchers customizados para o DOM |
| `@vitejs/plugin-react` | ^5 | Suporte a JSX nos testes |
| `msw` | ^2 | Mock Service Worker (disponível para uso futuro) |
| `jsdom` | ^28 | Ambiente de DOM simulado |

### Estrutura

```
__tests__/
  mocks/
    supabase.ts       # Mock centralizado do cliente Supabase (browser + server)
  unit/
    actions/          # Testes de server actions — 6 arquivos
    hooks/            # Testes de custom hooks — 9 arquivos
    validations/      # Testes de schemas Zod — 5 arquivos
```

### Status

**22 arquivos de teste | 186 testes | 100% passando**

### `__tests__/mocks/supabase.ts`

Mock centralizado que substitui o cliente Supabase nos testes. Exporta:
- `mockSupabaseClient` — objeto com métodos `from`, `auth`, etc. todos mockados com `vi.fn()`
- Os mocks simulam o padrão de chaining do Supabase (`.from().select()`, `.from().insert()`, etc.)

### `__tests__/unit/actions/`

Testes das Server Actions. Cada arquivo testa as funções CRUD de uma entidade.

| Arquivo | Entidade | Testes |
|---------|----------|--------|
| `customers.test.ts` | Clientes | createCustomer, updateCustomer, deleteCustomer, getCustomers |
| `products.test.ts` | Produtos | createProduct, updateProduct, deleteProduct, getProducts, checkLowStock |
| `orders.test.ts` | Pedidos | createOrder, updateOrderStatus, deleteOrder, getOrders |
| `expenses.test.ts` | Despesas | createExpense, updateExpense, deleteExpense, getExpenses |
| `revenues.test.ts` | Receitas Financeiras | createRevenue, updateRevenue, deleteRevenue, getRevenues |
| `recipes.test.ts` | Receitas (ficha) | createRecipe, updateRecipe, deleteRecipe |
| `ingredients.test.ts` | Ingredientes | createIngredient, updateIngredient, deleteIngredient |
| `transactions.test.ts` | Transações | getTransactions, getMonthSummary |

**Padrão de teste para actions:**
- Sucesso: verifica que o Supabase foi chamado com os dados corretos
- Erro Supabase: verifica que o erro é propagado
- Validação rejeitada: verifica que dados inválidos lançam erro Zod antes de chamar o Supabase

### `__tests__/unit/hooks/`

Testes dos custom hooks usando `renderHook` do Testing Library com `QueryClientProvider`.

| Arquivo | Hook | Testes |
|---------|------|--------|
| `useCustomers.test.ts` | useCustomers | loading state, dados retornados |
| `useProducts.test.ts` | useProducts | loading state, dados retornados |
| `useOrders.test.ts` | useOrders | loading state, dados retornados |
| `useIngredients.test.ts` | useIngredients | loading state, dados retornados |
| `useRecipes.test.ts` | useRecipes | loading state, dados retornados |
| `useExpenses.test.ts` | useExpenses | loading state, paginação, agregação por categoria |
| `useRevenues.test.ts` | useRevenues | loading state, totalAmount, paginação |
| `useDashboardStats.test.ts` | useDashboardStats | loading state, cálculo de KPIs |
| `useMutations.test.ts` | useMutations | todas as mutations (create/update/delete) com invalidação de cache |

### `__tests__/unit/validations/`

Testes dos schemas Zod de cada entidade.

| Arquivo | Schema | Testes |
|---------|--------|--------|
| `customer.schema.test.ts` | customerSchema | campos obrigatórios, formatos, edge cases |
| `product.schema.test.ts` | productSchema | tipos numéricos, validações de estoque |
| `order.schema.test.ts` | orderSchema | itens do pedido, status enum, UUID |
| `expense.schema.test.ts` | expenseSchema | datas, categorias, valores positivos |
| `revenue.schema.test.ts` | revenueSchema | datas, valores, cálculo de total |

### Comandos

```bash
yarn test              # Rodar todos os testes
yarn test --watch      # Modo watch (TDD)
yarn test --coverage   # Relatório de cobertura de código
```
