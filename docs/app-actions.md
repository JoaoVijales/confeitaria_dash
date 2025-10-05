## `app/actions/`

Este diretório contém as Server Actions do Next.js. Server Actions são funções assíncronas que podem ser chamadas diretamente de componentes do cliente para executar operações no servidor, como manipulação de banco de dados. Elas são uma forma de criar APIs sem a necessidade de definir rotas API REST tradicionais.

### Considerações Importantes sobre `cookies()` e Escopo de Requisição

Durante o desenvolvimento, foi identificado um problema comum ao usar a função `cookies()` do Next.js em Server Actions. A função `cookies()` é uma API dinâmica que deve ser chamada dentro do escopo de uma requisição. Inicialmente, `const cookieStore = cookies()` e a subsequente inicialização do cliente Supabase (`const supabase = createClient(cookieStore)`) estavam sendo feitas no nível superior de alguns módulos de ação. Isso resultava em erros de build com a mensagem "`cookies` was called outside a request scope."

**Resolução:**

Para garantir que `cookies()` seja sempre chamado dentro do escopo de uma requisição, a inicialização de `cookieStore` e `supabase` foi movida para dentro de cada função assíncrona (Server Action) que necessita acessar os cookies.

**Exemplo de Correção:**

```typescript
// Antes (causava erro):
// const cookieStore = await cookies();
// const supabase = createClient(cookieStore);

export async function someServerAction() {
  const cookieStore = await cookies(); // Correto: inicializado dentro da função
  const supabase = createClient(cookieStore);
  // ... lógica da ação
}
```

Esta abordagem garante que o `cookieStore` e o cliente Supabase sejam configurados corretamente para cada requisição, evitando o erro de escopo.

*   **`app/actions/customers.ts`**
    *   **Propósito:** Contém Server Actions relacionadas à manipulação de dados de clientes (criar, ler, atualizar, deletar).
    *   **Conteúdo Principal:**
        *   Importa `createClient` do `lib/supabase/server` para interagir com o Supabase.
        *   Define funções assíncronas como `createCustomer`, `updateCustomer`, `deleteCustomer`, `getCustomers`.
        *   Cada função interage com a tabela `customers` no Supabase.
        *   Utiliza `revalidatePath` do Next.js para invalidar o cache de dados e garantir que as páginas exibam os dados mais recentes após uma mutação.
    *   **Detalhes:**
        *   `getCustomers()`: Busca todos os clientes, ordenados por nome.
        *   `createCustomer(formData)`: Insere um novo cliente. Analisa `formData` e converte `is_vip` para booleano. Utiliza `customerSchema` para validação.
        *   `updateCustomer(id, formData)`: Atualiza um cliente existente. Analisa `formData` e converte `is_vip` para booleano. Utiliza `customerSchema` para validação.
        *   `deleteCustomer(id)`: Deleta um cliente.
        *   `updateCustomerStats(customerId)`: Função placeholder para futura lógica de cálculo de estatísticas do cliente (total de pedidos, total gasto).

*   **`app/actions/expenses.ts`**
    *   **Propósito:** Server Actions para gerenciar despesas.
    *   **Conteúdo Principal:** Funções para `createExpense`, `updateExpense`, `deleteExpense`, `getExpenses`. Interage com a tabela `expense_entries` do Supabase.
    *   **Detalhes:**
        *   `createExpense(formData)`: Insere uma nova despesa. Analisa `formData` e converte `quantity`, `unit_price`, `total` para números. Utiliza `expenseSchema` para validação.
        *   `updateExpense(id, formData)`: Atualiza uma despesa existente. Analisa `formData` e converte `quantity`, `unit_price`, `total` para números. Utiliza `expenseSchema` para validação.
        *   `deleteExpense(id)`: Deleta uma despesa.
        *   `getExpenses()`: Busca todas as despesas, ordenadas por data decrescente.

*   **`app/actions/ingredients.ts`**
    *   **Propósito:** Server Actions para gerenciar ingredientes.
    *   **Conteúdo Principal:** Funções para `createIngredient`, `updateIngredient`, `deleteIngredient`. Interage com a tabela `ingredients` do Supabase.
    *   **Detalhes:**
        *   `createIngredient(data)`: Insere um novo ingrediente.
        *   `updateIngredient(id, data)`: Atualiza um ingrediente existente.
        *   `deleteIngredient(id)`: Deleta um ingrediente.

*   **`app/actions/orders.ts`**
    *   **Propósito:** Server Actions para gerenciar pedidos.
    *   **Conteúdo Principal:** Funções para `createOrder`, `updateOrderStatus`, `deleteOrder`, `getOrders`, `getOrderDetails`. Interage com as tabelas `orders` e `order_items` do Supabase.
    *   **Detalhes:**
        *   `createOrder(data)`: Cria um novo pedido e seus itens associados (`order_items`) em uma transação simulada (rollback manual em caso de falha nos itens). Nota: `items` é um array de objetos.
        *   `updateOrderStatus(id, status)`: Atualiza o status de um pedido.
        *   `deleteOrder(id)`: Deleta um pedido e seus `order_items` associados (primeiro os itens para evitar violação de chave estrangeira).
        *   `getOrders()`: Busca todos os pedidos, incluindo o nome do cliente (`customers(name)`), ordenados por data de criação decrescente.
        *   `getOrderDetails(id)`: Busca detalhes de um pedido específico, incluindo informações do cliente (`customers(name, email)`) e itens do pedido com detalhes do produto (`order_items(*, products(name))`).

*   **`app/actions/products.ts`**
    *   **Propósito:** Server Actions para gerenciar produtos.
    *   **Conteúdo Principal:** Funções para `createProduct`, `updateProduct`, `deleteProduct`, `getProducts`, `checkLowStock`. Interage com a tabela `products` do Supabase.
    *   **Detalhes:**
        *   `createProduct(formData)`: Insere um novo produto. Analisa `formData` e converte `price`, `cost`, `stock`, `min_stock` para números. Utiliza `productSchema` para validação.
        *   `updateProduct(id, formData)`: Atualiza um produto existente. Analisa `formData` e converte `price`, `cost`, `stock`, `min_stock` para números. Utiliza `productSchema` para validação.
        *   `deleteProduct(id)`: Deleta um produto.
        *   `getProducts()`: Busca todos os produtos, ordenados por nome.
        *   `checkLowStock()`: Busca produtos cujo `stock` é menor que `min_stock`.

*   **`app/actions/recipes.ts`**
    *   **Propósito:** Server Actions para gerenciar receitas.
    *   **Conteúdo Principal:** Funções para `createRecipe`, `updateRecipe`, `deleteRecipe`. Interage com as tabelas `recipes` e `recipe_ingredients` do Supabase.
    *   **Detalhes:**
        *   `createRecipe(data)`: Cria uma nova receita e seus ingredientes associados (`recipe_ingredients`).
        *   `updateRecipe(id, data)`: Atualiza uma receita existente. Primeiro deleta os `recipe_ingredients` antigos e depois insere os novos.
        *   `deleteRecipe(id)`: Deleta uma receita.

*   **`app/actions/revenues.ts`**
    *   **Propósito:** Server Actions para gerenciar receitas (entradas financeiras).
    *   **Conteúdo Principal:** Funções para `createRevenue`, `updateRevenue`, `deleteRevenue`, `getRevenues`. Interage com a tabela `revenue_entries` do Supabase.
    *   **Detalhes:**
        *   `createRevenue(formData)`: Insere uma nova receita. Analisa `formData` e converte `quantity`, `unit_price`, `total` para números. Utiliza `revenueSchema` para validação.
        *   `updateRevenue(id, formData)`: Atualiza uma receita existente. Analisa `formData` e converte `quantity`, `unit_price`, `total` para números. Utiliza `revenueSchema` para validação.
        *   `deleteRevenue(id)`: Deleta uma receita.
        *   `getRevenues()`: Busca todas as receitas, ordenadas por data decrescente.

*   **`app/actions/transactions.ts`**
    *   **Propósito:** Server Actions para gerenciar transações financeiras e resumos mensais.
    *   **Conteúdo Principal:** Funções para `getTransactions`, `getMonthSummary`. Interage com as tabelas `revenue_entries`, `expense_entries` e `monthly_closures` do Supabase.
    *   **Detalhes:**
        *   `getTransactions(startDate, endDate)`: Busca receitas e despesas dentro de um período, combina-as e retorna uma lista de transações ordenadas por data. Despesas são representadas com `total` negativo.
        *   `getMonthSummary(month, year)`: Busca o fechamento mensal da tabela `monthly_closures` para um mês e ano específicos. Lida com o caso de não encontrar registros (`PGRST116`).
