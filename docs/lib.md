## `lib/`

Este diretório contém funções utilitárias, configurações e schemas de validação que são usados em toda a aplicação.

*   **`lib/mock-data.ts`**
    *   **Propósito:** Contém dados de exemplo (mock data) que podem ser usados para desenvolvimento e testes, antes que a integração completa com o backend esteja pronta ou para simular dados.
    *   **Conteúdo Principal:**
        *   Exporta arrays de objetos representando clientes, produtos, pedidos, etc., com estruturas de dados que espelham o que seria esperado do backend.
    *   **Detalhes:** É uma prática comum para acelerar o desenvolvimento do frontend. Em produção, esses dados seriam substituídos por chamadas reais à API.

*   **`lib/utils.ts`**
    *   **Propósito:** Contém funções utilitárias genéricas que podem ser usadas em qualquer parte da aplicação.
    *   **Conteúdo Principal:**
        *   `cn(...inputs: ClassValue[])`: Uma função utilitária para combinar classes CSS condicionalmente, usando a biblioteca `clsx` e `tailwind-merge`.
        *   Outras funções utilitárias podem ser adicionadas aqui conforme a necessidade (e.g., formatação de datas, manipulação de strings).
    *   **Detalhes:** `cn` é particularmente útil para construir strings de classes Tailwind dinamicamente, resolvendo conflitos de classes.

### `lib/supabase/`

Contém as configurações e clientes para interagir com o Supabase.

*   **`lib/supabase/client.ts`**
    *   **Propósito:** Configura e exporta uma instância do cliente Supabase para uso no lado do cliente (browser).
    *   **Conteúdo Principal:**
        *   Importa `createBrowserClient` do `@supabase/ssr`.
        *   Inicializa o cliente Supabase com as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        *   Exporta a instância do cliente.
    *   **Detalhes:** Este cliente é usado em componentes React para interações diretas com o Supabase (e.g., autenticação, real-time subscriptions), ou para chamar Server Actions que, por sua vez, usam o cliente do lado do servidor.

*   **`lib/supabase/server.ts`**
    *   **Propósito:** Configura e exporta uma instância do cliente Supabase para uso no lado do servidor (Server Components, Server Actions, Route Handlers).
    *   **Conteúdo Principal:**
        *   Importa `createServerClient` do `@supabase/ssr`.
        *   Inicializa o cliente Supabase com as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_ANON_KEY` dependendo do contexto de segurança).
        *   Exporta a instância do cliente.
    *   **Detalhes:** É crucial usar o cliente correto (browser vs. server) para garantir que as credenciais e o contexto de segurança apropriados sejam utilizados. O cliente do servidor geralmente tem mais privilégios ou é usado em contextos onde as chaves de API não devem ser expostas ao cliente.

### `lib/validations/`

Contém os schemas de validação definidos com a biblioteca Zod. Esses schemas são usados para validar dados de formulários e payloads de API.

*   **`lib/validations/expense.schema.ts`**
    *   **Propósito:** Define o schema de validação para dados de despesas.
    *   **Conteúdo Principal:**
        *   Exporta um objeto Zod (`expenseSchema`) que define a estrutura e as regras de validação para os campos de uma despesa (e.g., `amount` como número positivo, `description` como string não vazia).
    *   **Detalhes:** Usado em conjunto com `react-hook-form` e `zodResolver` para validação de formulários no frontend e pode ser reutilizado para validação de dados em Server Actions.

*   **`lib/validations/revenue.schema.ts`**
    *   **Propósito:** Define o schema de validação para dados de receitas (entradas financeiras).
    *   **Conteúdo Principal:**
        *   Exporta um objeto Zod (`revenueSchema`) que define a estrutura e as regras de validação para os campos de uma receita.
    *   **Detalhes:** Similar ao `expense.schema.ts`, mas para receitas.
