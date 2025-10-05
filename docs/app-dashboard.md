## `app/dashboard/`

Este diretório contém as páginas e o layout específico para a área de dashboard da aplicação.

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
        *   Utiliza `KpiCard` para exibir métricas importantes: "Vendas do Dia", "Pedidos Abertos", "Mais Vendido", "Lucro do Mês", "Margem Média" e "Balanço do Mês".
        *   Inclui gráficos de vendas (`SalesChart`) e produtos mais vendidos (`TopProductsChart`).
        *   Exibe uma tabela de "Pedidos Recentes" (últimos 5 pedidos).
        *   Apresenta gráficos adicionais: "Top 5 Produtos Mais Lucrativos" (BarChart) e "Despesas por Categoria" (PieChart).
        *   Utiliza `useDashboardStats` e `useOrders` (custom hooks) para buscar os dados.
        *   Implementa `Skeleton` para estados de carregamento e `EmptyState` para quando não há dados.
    *   **Detalhes:** Esta página é rica em componentes de UI e lógica de apresentação de dados, sendo um bom exemplo de como os hooks e componentes são integrados.

*   **`app/dashboard/clientes/page.tsx`**
    *   **Propósito:** Página para gerenciar clientes.
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de clientes com colunas: "Cliente", "Contato", "Pedidos", "Total Gasto", "Última Compra" e "Ações".
        *   Permite adicionar, editar e excluir clientes através de `CustomerFormDialog` e `ConfirmDialog`.
        *   Funcionalidades de busca por nome, email ou telefone.
        *   Utiliza `useCustomers` (custom hook) para buscar dados de clientes.
        *   Integra `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer` (custom hooks de mutação).
        *   Exibe `Badge` para clientes VIP e ícone de `Cake` para aniversariantes do dia.
        *   Utiliza `toast` para notificações de sucesso/erro.
        *   Inclui `EmptyState` e `Skeleton` para UX.
    *   **Detalhes:** Demonstra a interação entre componentes de UI (tabela, botões, inputs), hooks de dados e mutações de Server Actions.

*   **`app/dashboard/despesas/page.tsx`**
    *   **Propósito:** Página para gerenciar despesas.
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de despesas com colunas: "Data", "Categoria", "Descrição", "Valor" e "Ações".
        *   Permite adicionar, editar e excluir despesas através de `ExpenseFormDialog`.
        *   Funcionalidades de busca por descrição e filtro por categoria.
        *   Utiliza `useExpenses` (custom hook) para buscar dados de despesas.
        *   Integra `useDeleteExpense` (custom hook de mutação) com atualização otimista e rollback em caso de erro.
        *   Exibe `Badge` para categorias com cores personalizadas (`categoryColors`).
        *   Inclui controles de paginação.
    *   **Detalhes:** Interage com as Server Actions e hooks relacionados a despesas, demonstrando padrões de UI e UX para gerenciamento de listas.

*   **`app/dashboard/entradas/page.tsx`**
    *   **Propósito:** Página para gerenciar entradas financeiras (receitas).
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de entradas com colunas: "Data", "Descrição", "Qtd", "Valor Unit", "Total" e "Ações".
        *   Permite adicionar, editar e excluir entradas através de `RevenueFormDialog`.
        *   Funcionalidade de busca por descrição.
        *   Utiliza `useRevenues` (custom hook) para buscar dados de receitas.
        *   Integra `useDeleteRevenue` (custom hook de mutação) com atualização otimista e rollback em caso de erro.
        *   Inclui controles de paginação.
    *   **Detalhes:** Similar às páginas anteriores, mas focada em receitas financeiras.

*   **`app/dashboard/financeiro/page.tsx`**
    *   **Propósito:** Página para uma visão financeira mais detalhada.
    *   **Conteúdo Principal:**
        *   Exibe `KpiCard`s para "Receita Total", "Despesas Totais", "Lucro Líquido" e "Margem de Lucro".
        *   Inclui um gráfico de linhas "Receitas vs Despesas" (`LineChart`) e um gráfico de pizza "Despesas por Categoria" (`PieChart`) com rótulos personalizados.
        *   Apresenta uma tabela de "Últimas Transações" com filtros por período, categoria e tipo.
        *   Utiliza `useFinancials` (custom hook) para buscar e agregar dados financeiros.
    *   **Detalhes:** Fornece uma visão abrangente da saúde financeira da confeitaria com visualizações interativas.

*   **`app/dashboard/ingredientes/page.tsx`**
    *   **Propósito:** Página para gerenciar ingredientes.
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de ingredientes com colunas: "Nome", "Categoria", "Custo Unitário", "Estoque Atual", "Estoque Mínimo" e "Ações".
        *   Permite adicionar, editar e excluir ingredientes através de `IngredientFormDialog`.
        *   Funcionalidade de busca por nome ou categoria.
        *   Exibe `Badge` de "Estoque baixo!" quando `current_stock` é menor que `min_stock`.
        *   Utiliza `useIngredients` (custom hook) para buscar dados.
        *   Chama diretamente as Server Actions `createIngredient`, `updateIngredient`, `deleteIngredient`.
    *   **Detalhes:** Foca na gestão de inventário de ingredientes com alertas visuais para estoque baixo.

*   **`app/dashboard/pedidos/page.tsx`**
    *   **Propósito:** Página para gerenciar pedidos.
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de pedidos com colunas: "ID", "Cliente", "Data", "Status", "Total" e "Ações".
        *   Permite criar novos pedidos via `OrderFormDialog`.
        *   Permite atualizar o status do pedido via `UpdateOrderStatusDialog` e excluir pedidos via `ConfirmDialog`.
        *   Funcionalidade de busca por nome do cliente ou ID do pedido.
        *   Exibe `Badge` e ícones (`statusIcons`) para o status do pedido.
        *   Utiliza `useOrders` (custom hook) para buscar dados.
        *   Integra `useCreateOrder`, `useUpdateOrderStatus`, `useDeleteOrder` (custom hooks de mutação).
    *   **Detalhes:** Centraliza a gestão de pedidos, desde a criação até a atualização de status e exclusão.

*   **`app/dashboard/produtos/page.tsx`**
    *   **Propósito:** Página para gerenciar produtos.
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de produtos com colunas: "Produto", "Categoria", "Preço", "Custo", "Margem", "Estoque" e "Ações".
        *   Permite adicionar, editar e excluir produtos através de `ProductFormDialog` e `ConfirmDialog`.
        *   Funcionalidades de busca por nome e filtro por categoria.
        *   Exibe `Badge` para categorias e margem de lucro (com cores baseadas no valor).
        *   Mostra o progresso do estoque (`Progress`) e `Badge` de "Baixo" quando `stock` é menor que `min_stock`.
        *   Utiliza `useProducts` (custom hook) para buscar dados.
        *   Integra `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct` (custom hooks de mutação).
        *   Inclui a função utilitária `calculateMargin` para cálculo da margem de lucro.
    *   **Detalhes:** Oferece uma visão completa e ferramentas para a gestão do catálogo de produtos e seu inventário.

*   **`app/dashboard/receitas/page.tsx`**
    *   **Propósito:** Página para gerenciar receitas de produtos (como fazer um bolo, por exemplo).
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de receitas com colunas: "Produto", "Ingredientes", "Custo Total", "Rendimento", "Margem" e "Ações".
        *   Permite adicionar, editar e excluir receitas através de `RecipeFormDialog`.
        *   Calcula o custo unitário e a margem de lucro de cada receita dinamicamente.
        *   Utiliza `useRecipes` (custom hook) para buscar dados.
        *   Chama diretamente as Server Actions `createRecipe`, `updateRecipe`, `deleteRecipe`.
    *   **Detalhes:** Foca na gestão de receitas, permitindo o cálculo de custos e margens com base nos ingredientes.

*   **`app/dashboard/saidas/page.tsx`**
    *   **Propósito:** Página para gerenciar saídas (despesas).
    *   **Conteúdo Principal:**
        *   Exibe uma tabela de saídas com colunas: "Data", "Categoria", "Descrição", "Valor" e "Ações".
        *   Permite adicionar, editar e excluir saídas através de `ExpenseFormDialog`.
        *   Funcionalidades de busca por descrição e filtro por categoria.
        *   Utiliza `useExpenses` (custom hook) para buscar dados de saídas.
        *   Integra `useDeleteExpense` (custom hook de mutação) com atualização otimista e rollback em caso de erro.
        *   Exibe `Badge` para categorias com cores personalizadas (`categoryColors`).
        *   Inclui controles de paginação.
    *   **Detalhes:** Esta página é uma duplicação funcional de `app/dashboard/despesas/page.tsx`, ambas gerenciando despesas. Pode ser um ponto para futura refatoração para consolidar a lógica.
