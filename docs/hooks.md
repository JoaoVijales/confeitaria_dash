## `hooks/`

Este diretório contém custom React Hooks, que encapsulam lógica de estado e/ou efeitos colaterais para serem reutilizados em diferentes componentes. Muitos desses hooks utilizam `@tanstack/react-query` para gerenciamento de dados assíncronos (fetching, caching, updating).

## `hooks/`

Este diretório contém custom React Hooks, que encapsulam lógica de estado e/ou efeitos colaterais para serem reutilizados em diferentes componentes. Muitos desses hooks utilizam `@tanstack/react-query` para gerenciamento de dados assíncronos (fetching, caching, updating).

*   **`hooks/useCustomers.ts`**
    *   **Propósito:** Hook personalizado para buscar e gerenciar dados de clientes.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` do `@tanstack/react-query` para buscar a lista de clientes da tabela `customers` do Supabase.
        *   A query `select` inclui uma junção com `orders` (`orders (created_at, total)`).
        *   Processa os dados retornados para calcular `last_purchase`, `total_spent` e `total_orders` no cliente.
    *   **Detalhes:** Fornece uma interface limpa para componentes que precisam acessar a lista de clientes, lidando com carregamento, erros e cache de dados automaticamente.

*   **`hooks/useDashboardStats.ts`**
    *   **Propósito:** Hook para buscar e agregar dados estatísticos para o dashboard.
    *   **Conteúdo Principal:**
        *   Realiza múltiplas consultas ao Supabase para `orders`, `expenses` e `products`.
        *   Calcula `monthlyRevenue`, `monthlyExpenses`, `monthlyProfit`, `totalMargin`, `averageMargin`.
        *   Identifica `topProfitableProducts` e agrega `expensesByCategoryChartData`.
        *   Busca `dailySales` e `openOrders` separadamente.
        *   Processa `order_items` para determinar `productSales` e o `topSellingProduct`.
    *   **Detalhes:** Centraliza a lógica de busca e agregação de dados para o dashboard, tornando a página do dashboard mais limpa e focada na apresentação.

*   **`hooks/useExpenses.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de despesas.
    *   **Conteúdo Principal:**
        *   Chama a Server Action `getExpenses` para buscar os dados.
        *   Implementa lógica de paginação no cliente (`startIndex`, `endIndex`, `paginatedEntries`, `totalPages`).
        *   Agrega `expensesByCategory` a partir dos dados brutos.
    *   **Detalhes:** Retorna os dados paginados, a agregação por categoria e o total de páginas.

*   **`hooks/useFinancials.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados financeiros mais abrangentes.
    *   **Conteúdo Principal:**
        *   Chama a Server Action `getMonthSummary` para o resumo mensal.
        *   Busca `revenue_entries` e `expense_entries` do Supabase.
        *   Calcula `totalRevenue`, `totalExpenses`, `netProfit` e `profitMargin`.
        *   Prepara `revenueVsExpensesData` para os últimos 6 meses e `expensesByCategoryChartData`.
        *   Chama a Server Action `getTransactions` para `recentTransactions`.
    *   **Detalhes:** Fornece dados para a página de visão financeira, incluindo cálculos agregados e dados formatados para gráficos.

*   **`hooks/useIngredients.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de ingredientes.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar todos os ingredientes (`select('*')`) da tabela `ingredients` do Supabase.
    *   **Detalhes:** Fornece uma interface simples para acessar a lista de ingredientes.

*   **`hooks/useMutations.ts`**
    *   **Propósito:** Centraliza e fornece utilitários para operações de mutação (criar, atualizar, deletar) usando `useMutation` do `@tanstack/react-query`.
    *   **Conteúdo Principal:**
        *   Exporta funções como `useCreateRevenue`, `useUpdateRevenue`, `useDeleteRevenue`, `useCreateExpense`, `useUpdateExpense`, `useDeleteExpense`, `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useCreateOrder`, `useUpdateOrderStatus`, `useDeleteOrder`.
        *   Cada mutação chama a Server Action correspondente (e.g., `createRevenue`).
        *   A lógica `onSuccess` de cada mutação invalida as `queryKey`s relevantes (e.g., `['revenues']`, `['financials']`, `['customers']`, `['products']`, `['orders']`) para garantir que os dados em cache sejam atualizados.
    *   **Detalhes:** Ajuda a padronizar o tratamento de mutações e a lógica de invalidação de cache em toda a aplicação.

*   **`hooks/useOrders.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de pedidos.
    *   **Conteúdo Principal:**
        *   Chama a Server Action `getOrders` para buscar os dados.
    *   **Detalhes:** Fornece uma interface simples para acessar a lista de pedidos.

*   **`hooks/useProducts.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de produtos.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar produtos da tabela `products` do Supabase, selecionando `id`, `name`, `price`, `cost`, `stock`, `min_stock` e `category`.
    *   **Detalhes:** Fornece uma interface simples para acessar a lista de produtos com seus detalhes.

*   **`hooks/useRecipes.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de receitas.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar receitas da tabela `recipes` do Supabase.
        *   A query `select` inclui junções com `products` (`id`, `name`, `price`, `cost`) e `recipe_ingredients` (que por sua vez inclui `ingredients` com `id`, `name`, `unit`, `unit_cost`).
    *   **Detalhes:** Fornece uma interface para acessar receitas com todos os seus produtos e ingredientes associados.

*   **`hooks/useRevenues.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de receitas (entradas financeiras).
    *   **Conteúdo Principal:**
        *   Chama a Server Action `getRevenues` para buscar os dados.
        *   Calcula o `totalAmount` de todas as receitas.
        *   Implementa lógica de paginação no cliente (`startIndex`, `endIndex`, `paginatedEntries`, `totalPages`).
    *   **Detalhes:** Retorna os dados paginados, o valor total e o total de páginas.

*   **`hooks/useSalesChart.ts`**
    *   **Propósito:** Hook para buscar e formatar dados especificamente para o gráfico de vendas.
    *   **Conteúdo Principal:**
        *   Busca `orders` do Supabase, filtrando pelos últimos 7 dias.
        *   Agrega os dados de vendas por dia da semana no cliente.
    *   **Detalhes:** Retorna os dados formatados para o `SalesChart`.

*   **`hooks/useTopProductsChart.ts`**
    *   **Propósito:** Hook para buscar e formatar dados especificamente para o gráfico de produtos mais vendidos.
    *   **Conteúdo Principal:**
        *   Busca `order_items` do Supabase, incluindo junção com `products`.
        *   Agrega a quantidade vendida por produto no cliente e identifica os 5 produtos mais vendidos.
    *   **Detalhes:** Retorna os dados formatados para o `TopProductsChart`.

*   **`hooks/useTransactions.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de transações.
    *   **Conteúdo Principal:**
        *   Chama a Server Action `getTransactions` para buscar os dados de transações dentro de um período.
    *   **Detalhes:** Fornece uma interface simples para acessar a lista de transações financeiras.
