## `app/actions/`

Este diretório contém as Server Actions do Next.js. Server Actions são funções assíncronas que podem ser chamadas diretamente de componentes do cliente para executar operações no servidor, como manipulação de banco de dados. Elas são uma forma de criar APIs sem a necessidade de definir rotas API REST tradicionais.

*   **`app/actions/customers.ts`**
    *   **Propósito:** Contém Server Actions relacionadas à manipulação de dados de clientes (criar, ler, atualizar, deletar).
    *   **Conteúdo Principal:**
        *   Importa `createClient` do `lib/supabase/server` para interagir com o Supabase.
        *   Define funções assíncronas como `createCustomer`, `updateCustomer`, `deleteCustomer`, `getCustomers`.
        *   Cada função interage com a tabela `customers` no Supabase.
        *   Utiliza `revalidatePath` do Next.js para invalidar o cache de dados e garantir que as páginas exibam os dados mais recentes após uma mutação.
    *   **Detalhes:**
        *   `getCustomers()`: Busca todos os clientes.
        *   `createCustomer(customerData)`: Insere um novo cliente.
        *   `updateCustomer(id, customerData)`: Atualiza um cliente existente.
        *   `deleteCustomer(id)`: Deleta um cliente.
        *   A validação dos dados de entrada para essas ações provavelmente é feita no lado do cliente (com Zod) antes de chamar a Server Action.

*   **`app/actions/expenses.ts`**
    *   **Propósito:** Server Actions para gerenciar despesas.
    *   **Conteúdo Principal:** Funções para `createExpense`, `updateExpense`, `deleteExpense`, `getExpenses`. Interage com a tabela `expenses` do Supabase.

*   **`app/actions/ingredients.ts`**
    *   **Propósito:** Server Actions para gerenciar ingredientes.
    *   **Conteúdo Principal:** Funções para `createIngredient`, `updateIngredient`, `deleteIngredient`, `getIngredients`. Interage com a tabela `ingredients` do Supabase.

*   **`app/actions/orders.ts`**
    *   **Propósito:** Server Actions para gerenciar pedidos.
    *   **Conteúdo Principal:** Funções para `createOrder`, `updateOrder`, `deleteOrder`, `getOrders`. Interage com a tabela `orders` do Supabase.

*   **`app/actions/products.ts`**
    *   **Propósito:** Server Actions para gerenciar produtos.
    *   **Conteúdo Principal:** Funções para `createProduct`, `updateProduct`, `deleteProduct`, `getProducts`. Interage com a tabela `products` do Supabase.

*   **`app/actions/recipes.ts`**
    *   **Propósito:** Server Actions para gerenciar receitas.
    *   **Conteúdo Principal:** Funções para `createRecipe`, `updateRecipe`, `deleteRecipe`, `getRecipes`. Interage com a tabela `recipes` do Supabase.

*   **`app/actions/revenues.ts`**
    *   **Propósito:** Server Actions para gerenciar receitas (entradas financeiras).
    *   **Conteúdo Principal:** Funções para `createRevenue`, `updateRevenue`, `deleteRevenue`, `getRevenues`. Interage com a tabela `revenues` do Supabase.

*   **`app/actions/transactions.ts`**
    *   **Propósito:** Server Actions para gerenciar transações (provavelmente um log geral de movimentos financeiros).
    *   **Conteúdo Principal:** Funções para `createTransaction`, `getTransactions`. Interage com a tabela `transactions` do Supabase.
