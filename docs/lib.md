## `lib/`

Este diretório contém funções utilitárias, configurações e schemas de validação que são usados em toda a aplicação.

## `lib/`

Este diretório contém funções utilitárias, configurações e schemas de validação que são usados em toda a aplicação.

*   **`lib/mock-data.ts`**
    *   **Propósito:** Contém dados de exemplo (mock data) que podem ser usados para desenvolvimento e testes, antes que a integração completa com o backend esteja pronta ou para simular dados.
    *   **Conteúdo Principal:**
        *   Exporta várias interfaces (`OrderItem`, `Order`, `Product`, `Customer`) e arrays de dados mock (`dailySales`, `openOrders`, `topSellingProduct`, `weeklySalesData`, `topProductsData`, `dailySalesData`, `openOrdersData`, `topSellingProductData`, `weeklyQuantityData`, `weeklyProfitData`, `allOrders`, `allProducts`, `allCustomers`, `monthlyClientGrowth`).
    *   **Detalhes:** É uma prática comum para acelerar o desenvolvimento do frontend, fornecendo dados estruturados para simular o comportamento da API.

*   **`lib/utils.ts`**
    *   **Propósito:** Contém funções utilitárias genéricas que podem ser usadas em qualquer parte da aplicação.
    *   **Conteúdo Principal:**
        *   `cn(...inputs: ClassValue[])`: Uma função utilitária para combinar classes CSS condicionalmente, usando a biblioteca `clsx` e `tailwind-merge`.
    *   **Detalhes:** `cn` é particularmente útil para construir strings de classes Tailwind dinamicamente, resolvendo conflitos de classes e garantindo a aplicação correta dos estilos.

### `lib/supabase/`

Contém as configurações e clientes para interagir com o Supabase.

*   **`lib/supabase/client.ts`**
    *   **Propósito:** Configura e exporta uma instância do cliente Supabase para uso no lado do cliente (browser).
    *   **Conteúdo Principal:**
        *   Importa `createBrowserClient` do `@supabase/ssr`.
        *   Inicializa o cliente Supabase com as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   **Detalhes:** Este cliente é usado em componentes React para interações diretas com o Supabase (e.g., autenticação, real-time subscriptions), ou para chamar Server Actions que, por sua vez, usam o cliente do lado do servidor.

*   **`lib/supabase/server.ts`**
    *   **Propósito:** Configura e exporta uma instância do cliente Supabase para uso no lado do servidor (Server Components, Server Actions, Route Handlers).
    *   **Conteúdo Principal:**
        *   Importa `createServerClient` do `@supabase/ssr`.
        *   Inicializa o cliente Supabase com as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        *   Implementa um objeto `cookies` com métodos `get`, `set` e `remove` para manipular cookies no contexto do servidor, utilizando `ReadonlyRequestCookies` do Next.js.
    *   **Detalhes:** É crucial usar o cliente correto (browser vs. server) para garantir que as credenciais e o contexto de segurança apropriados sejam utilizados. O cliente do servidor é essencial para operações seguras que não devem expor chaves de API ao cliente.

### `lib/validations/`

Contém os schemas de validação definidos com a biblioteca Zod. Esses schemas são usados para validar dados de formulários e payloads de API.

*   **`lib/validations/customer.schema.ts`**
    *   **Propósito:** Define o schema de validação para dados de clientes.
    *   **Conteúdo Principal:**
        *   Exporta um objeto Zod (`customerSchema`) com os campos: `name` (string, mínimo 3 caracteres), `email` (string, formato de email válido), `phone` (string, mínimo 10 caracteres) e `is_vip` (boolean).
        *   Exporta o tipo `CustomerFormValues` inferido do schema.
    *   **Detalhes:** Usado em conjunto com `react-hook-form` e `zodResolver` para validação de formulários no frontend e pode ser reutilizado para validação de dados em Server Actions.

*   **`lib/validations/expense.schema.ts`**
    *   **Propósito:** Define o schema de validação para dados de despesas.
    *   **Conteúdo Principal:**
        *   Exporta um objeto Zod (`expenseSchema`) com os campos: `date` (string, obrigatório), `description` (string, obrigatório), `category` (string, obrigatório), `quantity` (number, positivo), `unit_price` (number, positivo) e `total` (number, positivo).
        *   Exporta o tipo `ExpenseFormValues` inferido do schema.
    *   **Detalhes:** Usado para garantir a integridade dos dados de despesas em formulários e operações de API.

*   **`lib/validations/order.schema.ts`**
    *   **Propósito:** Define o schema de validação para dados de pedidos.
    *   **Conteúdo Principal:**
        *   Exporta um `orderItemSchema` para validar itens individuais do pedido (campos: `product_id`, `quantity` (number, mínimo 1), `unit_price`).
        *   Exporta o `orderSchema` principal com os campos: `customer_id` (string, UUID válido), `items` (array de `orderItemSchema`, mínimo 1 item), `total` (number, positivo) e `status` (enum com valores 'Pendente', 'Em Preparo', 'Pronto para Retirada', 'Finalizado', 'Cancelado').
        *   Exporta o tipo `OrderFormValues` inferido do schema.
    *   **Detalhes:** Usado para garantir a integridade dos dados de pedidos, incluindo a validação de seus itens.

*   **`lib/validations/product.schema.ts`**
    *   **Propósito:** Define o schema de validação para dados de produtos.
    *   **Conteúdo Principal:**
        *   Exporta um objeto Zod (`productSchema`) com os campos: `name` (string, mínimo 3 caracteres), `category` (string, obrigatório), `price` (number, positivo), `cost` (number, positivo), `stock` (number, não negativo) e `min_stock` (number, não negativo).
        *   Exporta o tipo `ProductFormValues` inferido do schema.
    *   **Detalhes:** Usado para garantir a integridade dos dados de produtos, incluindo informações de preço, custo e estoque.

*   **`lib/validations/revenue.schema.ts`**
    *   **Propósito:** Define o schema de validação para dados de receitas (entradas financeiras).
    *   **Conteúdo Principal:**
        *   Exporta um objeto Zod (`revenueSchema`) com os campos: `date` (string, obrigatório), `description` (string, obrigatório), `quantity` (number, positivo), `unit_price` (number, positivo) e `total` (number, positivo).
        *   Exporta o tipo `RevenueFormValues` inferido do schema.
    *   **Detalhes:** Usado para garantir a integridade dos dados de receitas financeiras em formulários e operações de API.
