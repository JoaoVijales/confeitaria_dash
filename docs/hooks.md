## `hooks/`

Este diretório contém custom React Hooks, que encapsulam lógica de estado e/ou efeitos colaterais para serem reutilizados em diferentes componentes. Muitos desses hooks utilizam `@tanstack/react-query` para gerenciamento de dados assíncronos (fetching, caching, updating).

*   **`hooks/useCustomers.ts`**
    *   **Propósito:** Hook personalizado para buscar e gerenciar dados de clientes.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` do `@tanstack/react-query` para buscar a lista de clientes através da Server Action `getCustomers` (de `app/actions/customers.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Fornece uma interface limpa para componentes que precisam acessar a lista de clientes, lidando com carregamento, erros e cache de dados automaticamente.

*   **`hooks/useDashboardStats.ts`**
    *   **Propósito:** Hook para buscar e agregar dados estatísticos para o dashboard.
    *   **Conteúdo Principal:**
        *   Provavelmente utiliza `useQuery` para buscar dados de várias fontes (vendas, pedidos, produtos, finanças) através de Server Actions específicas ou uma única Server Action que retorna um objeto de estatísticas agregadas.
        *   Retorna um objeto contendo as estatísticas do dashboard (`dailySales`, `openOrders`, `topSellingProduct`, `monthlyProfit`, `averageMargin`, `expensesByCategoryChartData`, etc.).
    *   **Detalhes:** Centraliza a lógica de busca de dados para o dashboard, tornando a página do dashboard mais limpa e focada na apresentação.

*   **`hooks/useExpenses.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de despesas.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar a lista de despesas através da Server Action `getExpenses` (de `app/actions/expenses.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Similar a `useCustomers`, mas para despesas.

*   **`hooks/useFinancials.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados financeiros mais abrangentes.
    *   **Conteúdo Principal:**
        *   Provavelmente utiliza `useQuery` para buscar dados de receitas, despesas e transações, possivelmente com filtros de período.
        *   Retorna dados agregados como balanço, lucro, etc.
    *   **Detalhes:** Fornece dados para a página de visão financeira.

*   **`hooks/useIngredients.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de ingredientes.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar a lista de ingredientes através da Server Action `getIngredients` (de `app/actions/ingredients.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Similar a `useCustomers`, mas para ingredientes.

*   **`hooks/useMutations.ts`**
    *   **Propósito:** Este hook provavelmente centraliza ou fornece utilitários para operações de mutação (criar, atualizar, deletar) usando `useMutation` do `@tanstack/react-query`.
    *   **Conteúdo Principal:**
        *   Pode exportar funções que retornam instâncias de `useMutation` configuradas para diferentes Server Actions (e.g., `useCreateCustomer`, `useUpdateProduct`, `useDeleteRevenue`).
        *   Essas mutações geralmente incluem lógica para invalidar queries (`queryClient.invalidateQueries`) após uma operação bem-sucedida, garantindo que os dados em cache sejam atualizados.
    *   **Detalhes:** Ajuda a padronizar o tratamento de mutações e a lógica de invalidação de cache em toda a aplicação.

*   **`hooks/useOrders.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de pedidos.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar a lista de pedidos através da Server Action `getOrders` (de `app/actions/orders.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Similar a `useCustomers`, mas para pedidos.

*   **`hooks/useProducts.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de produtos.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar a lista de produtos através da Server Action `getProducts` (de `app/actions/products.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Similar a `useCustomers`, mas para produtos.

*   **`hooks/useRecipes.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de receitas.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar a lista de receitas através da Server Action `getRecipes` (de `app/actions/recipes.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Similar a `useCustomers`, mas para receitas.

*   **`hooks/useRevenues.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de receitas (entradas financeiras).
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar a lista de receitas através da Server Action `getRevenues` (de `app/actions/revenues.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Similar a `useCustomers`, mas para receitas financeiras.

*   **`hooks/useSalesChart.ts`**
    *   **Propósito:** Hook para buscar e formatar dados especificamente para o gráfico de vendas.
    *   **Conteúdo Principal:**
        *   Provavelmente busca dados de vendas (e.g., de `getOrders` ou uma Server Action específica para relatórios) e os processa para o formato esperado pelo `SalesChart` (e.g., agregando vendas por dia/semana).
        *   Retorna os dados formatados para o gráfico, além do estado de carregamento e erro.
    *   **Detalhes:** Separa a lógica de preparação de dados do componente de apresentação do gráfico.

*   **`hooks/useTopProductsChart.ts`**
    *   **Propósito:** Hook para buscar e formatar dados especificamente para o gráfico de produtos mais vendidos.
    *   **Conteúdo Principal:**
        *   Provavelmente busca dados de pedidos/produtos e os agrega para identificar os produtos mais vendidos, formatando-os para o `TopProductsChart`.
        *   Retorna os dados formatados para o gráfico, além do estado de carregamento e erro.
    *   **Detalhes:** Similar a `useSalesChart`, mas para produtos.

*   **`hooks/useTransactions.ts`**
    *   **Propósito:** Hook para buscar e gerenciar dados de transações.
    *   **Conteúdo Principal:**
        *   Utiliza `useQuery` para buscar a lista de transações através da Server Action `getTransactions` (de `app/actions/transactions.ts`).
        *   Retorna o estado da query (`data`, `isLoading`, `error`).
    *   **Detalhes:** Similar a `useCustomers`, mas para transações.
