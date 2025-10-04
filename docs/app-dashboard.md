## `app/dashboard/`

Este diretório contém as páginas e o layout específico para a área de dashboard da aplicação.

*   **`app/dashboard/layout.tsx`**
    *   **Propósito:** Define o layout específico para todas as páginas dentro do dashboard. Ele inclui a `Sidebar` de navegação e a área de conteúdo principal.
    *   **Conteúdo Principal:**
        *   Importa o componente `Sidebar`.
        *   Renderiza a `Sidebar` e, ao lado dela, o `children` (que são as páginas do dashboard).
        *   Aplica estilos Tailwind para criar um layout de duas colunas (sidebar fixa e conteúdo rolável).
    *   **Detalhes:** Este layout garante que todas as páginas do dashboard tenham a mesma navegação lateral e estrutura visual.

*   **`app/dashboard/page.tsx`**
    *   **Propósito:** A página principal do dashboard, que oferece uma visão geral e estatísticas da confeitaria.
    *   **Conteúdo Principal:**
        *   Utiliza `KpiCard` para exibir métricas importantes (Vendas do Dia, Pedidos Abertos, Mais Vendido, Lucro do Mês, Margem Média, Balanço do Mês).
        *   Inclui gráficos de vendas (`SalesChart`) e produtos mais vendidos (`TopProductsChart`).
        *   Exibe uma lista de pedidos recentes.
        *   Utiliza `useDashboardStats` e `useOrders` (custom hooks) para buscar os dados.
        *   Implementa `Skeleton` para estados de carregamento e `EmptyState` para quando não há dados.
    *   **Detalhes:** Esta página é rica em componentes de UI e lógica de apresentação de dados, sendo um bom exemplo de como os hooks e componentes são integrados.

*   **`app/dashboard/clientes/page.tsx`**
    *   **Propósito:** Página para gerenciar clientes.
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de clientes com funcionalidades de busca e filtragem.
        *   Permite adicionar, editar e excluir clientes.
        *   Utiliza `useCustomers` (custom hook) para buscar dados de clientes.
        *   Integra `deleteCustomer` (Server Action) para exclusão.
        *   Inclui `EmptyState` e `Skeleton` para UX.
    *   **Detalhes:** Demonstra a interação entre componentes de UI (tabela, botões, inputs), hooks de dados e Server Actions.

*   **`app/dashboard/despesas/page.tsx`**
    *   **Propósito:** Página para gerenciar despesas.
    *   **Conteúdo Principal:** Similar à página de clientes, mas focada em despesas. Provavelmente exibe uma tabela de despesas, com opções de busca, filtragem e ações de CRUD.
    *   **Detalhes:** Interage com as Server Actions e hooks relacionados a despesas.

*   **`app/dashboard/entradas/page.tsx`**
    *   **Propósito:** Página para gerenciar entradas financeiras (receitas).
    *   **Conteúdo Principal:** Similar às páginas anteriores, mas para receitas. Exibe uma tabela de receitas, com opções de busca, filtragem e ações de CRUD.
    *   **Detalhes:** Interage com as Server Actions e hooks relacionados a receitas. Esta é a página que originalmente causou o erro de "sonner", indicando que ela utiliza a biblioteca de toasts.

*   **`app/dashboard/financeiro/page.tsx`**
    *   **Propósito:** Página para uma visão financeira mais detalhada.
    *   **Conteúdo Principal:** Provavelmente inclui gráficos, resumos e tabelas relacionadas a balanço, lucro, despesas e receitas ao longo do tempo.
    *   **Detalhes:** Utiliza `useFinancials` (custom hook) e pode integrar outros hooks de dados para compor a visão financeira.

*   **`app/dashboard/ingredientes/page.tsx`**
    *   **Propósito:** Página para gerenciar ingredientes.
    *   **Conteúdo Principal:** Tabela de ingredientes com funcionalidades de CRUD, busca e filtragem.
    *   **Detalhes:** Interage com as Server Actions e hooks relacionados a ingredientes.

*   **`app/dashboard/pedidos/page.tsx`**
    *   **Propósito:** Página para gerenciar pedidos.
    *   **Conteúdo Principal:** Tabela de pedidos com funcionalidades de CRUD, busca, filtragem por status e período.
    *   **Detalhes:** Utiliza `useOrders` (custom hook) e interage com `updateOrder`, `deleteOrder` (Server Actions). Inclui lógica para calcular lucro estimado por pedido.

*   **`app/dashboard/produtos/page.tsx`**
    *   **Propósito:** Página para gerenciar produtos.
    *   **Conteúdo Principal:** Tabela de produtos com funcionalidades de CRUD, busca, filtragem por categoria e estoque.
    *   **Detalhes:** Utiliza `useProducts` (custom hook) e interage com `createProduct`, `updateProduct`, `deleteProduct` (Server Actions). Inclui lógica para calcular margem de lucro e exibir progresso de estoque.

*   **`app/dashboard/receitas/page.tsx`**
    *   **Propósito:** Página para gerenciar receitas de produtos (como fazer um bolo, por exemplo).
    *   **Conteúdo Principal:** Tabela de receitas com funcionalidades de CRUD, busca e filtragem.
    *   **Detalhes:** Interage com as Server Actions e hooks relacionados a receitas.

*   **`app/dashboard/saidas/page.tsx`**
    *   **Propósito:** Página para gerenciar saídas (provavelmente vendas ou outros tipos de saídas de estoque/financeiras).
    *   **Conteúdo Principal:** Similar às páginas de despesas/entradas, mas focada em saídas.
    *   **Detalhes:** Interage com as Server Actions e hooks relacionados a transações ou saídas específicas.
