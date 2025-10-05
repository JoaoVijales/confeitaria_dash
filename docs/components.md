## `components/`

Este diretório contém componentes React reutilizáveis que são usados em várias partes da aplicação. Eles são divididos em subdiretórios para melhor organização.

*   **`components/EmptyState.tsx`**
    *   **Propósito:** Um componente genérico para exibir uma mensagem quando não há dados para mostrar (por exemplo, uma lista vazia, resultados de busca vazios).
    *   **Conteúdo Principal:**
        *   Recebe `title`, `description`, `icon` (um elemento React) e opcionalmente `action` (um objeto com `label` e `onClick`) como props.
        *   Renderiza um layout centralizado com um ícone, título, descrição e um botão de ação (se fornecido).
    *   **Detalhes:** Ajuda a melhorar a experiência do usuário, fornecendo feedback claro em estados vazios.

*   **`components/KpiCard.tsx`**
    *   **Propósito:** Um componente de cartão para exibir Key Performance Indicators (KPIs) ou métricas importantes.
    *   **Conteúdo Principal:**
        *   Recebe `title`, `value`, `icon`, `trend` (opcional), `data` (opcional, para um mini-gráfico), `prefix` (opcional), `suffix` (opcional) e `gradient` (para estilização de fundo) como props.
        *   Exibe o título, um ícone, o valor principal (com animação `CountUp` se for um número), um indicador de tendência (se `trend` for fornecido) e um mini-gráfico de linha (se `data` for fornecido).
    *   **Detalhes:** Utiliza `CountUp` para animação de números, `Badge` para o indicador de tendência e `ResponsiveContainer` com `LineChart` do Recharts para o mini-gráfico.

*   **`components/Sidebar.tsx`**
    *   **Propósito:** O componente de barra lateral de navegação principal para o dashboard.
    *   **Conteúdo Principal:**
        *   Exibe o logo da aplicação e uma lista de links de navegação para as diferentes seções do dashboard.
        *   Utiliza `usePathname` do Next.js para destacar o link ativo.
        *   Inclui um botão de logout que utiliza `createClient` do Supabase para realizar o logout.
    *   **Detalhes:** Os links são definidos em um array de objetos, tornando-os fáceis de gerenciar. O estilo do link ativo é aplicado dinamicamente.

### `components/charts/`

Contém componentes específicos para a renderização de gráficos.

*   **`components/charts/SalesChart.tsx`**
    *   **Propósito:** Exibe um gráfico de barras representando dados de vendas ao longo do tempo.
    *   **Conteúdo Principal:**
        *   Utiliza `useSalesChart` (custom hook) para buscar os dados do gráfico.
        *   Renderiza um `BarChart` do Recharts com `XAxis`, `YAxis`, `Tooltip` e `CartesianGrid`.
        *   Inclui um `CustomTooltip` para exibir informações detalhadas ao passar o mouse sobre as barras.
        *   Exibe `Skeleton` durante o carregamento e `EmptyState` se não houver dados.
    *   **Detalhes:** O gráfico é responsivo (`ResponsiveContainer`) e utiliza um gradiente para preencher as barras.

*   **`components/charts/TopProductsChart.tsx`**
    *   **Propósito:** Exibe um gráfico de pizza (donut) mostrando os produtos mais vendidos.
    *   **Conteúdo Principal:**
        *   Utiliza `useTopProductsChart` (custom hook) para buscar os dados do gráfico.
        *   Renderiza um `PieChart` do Recharts com `Pie`, `Cell`, `Legend` e `Tooltip`.
        *   Define cores personalizadas para as fatias do gráfico (`COLORS`).
        *   Inclui um `CustomTooltip` e uma função `renderLegend` personalizada.
        *   Exibe `Skeleton` durante o carregamento e `EmptyState` se não houver dados.
    *   **Detalhes:** O gráfico de pizza é configurado como um donut (`innerRadius`) e inclui um rótulo personalizado (`renderCustomizedLabel`) para exibir a porcentagem de cada fatia.

### `components/dialogs/`

Contém componentes de diálogo (modals) que são usados para formulários ou confirmações.

*   **`components/dialogs/CustomerFormDialog.tsx`**
    *   **Propósito:** Um diálogo que contém o formulário para adicionar ou editar um cliente.
    *   **Conteúdo Principal:**
        *   Envolve o componente `CustomerForm` (de `components/forms/CustomerForm.tsx`) dentro de um `Dialog` do Shadcn/ui.
        *   Recebe props para controlar a abertura/fechamento do diálogo (`open`, `onOpenChange`), os dados do cliente a ser editado (`customer`), e uma função para salvar (`onSubmit`).
    *   **Detalhes:** Atua como um wrapper para o formulário de cliente.

*   **`components/dialogs/ExpenseFormDialog.tsx`**
    *   **Propósito:** Um diálogo que contém o formulário para adicionar ou editar uma despesa.
    *   **Conteúdo Principal:**
        *   Envolve o componente `ExpenseForm` (de `components/forms/ExpenseForm.tsx`) dentro de um `Dialog` do Shadcn/ui.
        *   Recebe props para controlar a abertura/fechamento do diálogo (`open`, `onOpenChange`), os dados da despesa a ser editada (`expense`), e uma função para salvar (`onSave`).
    *   **Detalhes:** Este componente atua como um wrapper para o formulário, fornecendo a estrutura do diálogo.

*   **`components/dialogs/OrderFormDialog.tsx`**
    *   **Propósito:** Um diálogo que contém o formulário para criar ou editar um pedido.
    *   **Conteúdo Principal:**
        *   Envolve o componente `OrderForm` (de `components/forms/OrderForm.tsx`) dentro de um `Dialog` do Shadcn/ui.
        *   Recebe props para controlar a abertura/fechamento do diálogo (`open`, `onOpenChange`), os dados do pedido a ser editado (`order`), e uma função para salvar (`onSubmit`).
    *   **Detalhes:** Atua como um wrapper para o formulário de pedido.

*   **`components/dialogs/ProductFormDialog.tsx`**
    *   **Propósito:** Um diálogo que contém o formulário para adicionar ou editar um produto.
    *   **Conteúdo Principal:**
        *   Envolve o componente `ProductForm` (de `components/forms/ProductForm.tsx`) dentro de um `Dialog` do Shadcn/ui.
        *   Recebe props para controlar a abertura/fechamento do diálogo (`open`, `onOpenChange`), os dados do produto a ser editado (`product`), e uma função para salvar (`onSubmit`).
    *   **Detalhes:** Atua como um wrapper para o formulário de produto.

*   **`components/dialogs/RevenueFormDialog.tsx`**
    *   **Propósito:** Um diálogo que contém o formulário para adicionar ou editar uma entrada financeira (receita).
    *   **Conteúdo Principal:**
        *   Envolve o componente `RevenueForm` (de `components/forms/RevenueForm.tsx`) dentro de um `Dialog` do Shadcn/ui.
        *   Recebe props para controlar a abertura/fechamento do diálogo (`open`, `onOpenChange`), os dados da receita a ser editada (`revenue`), e uma função para salvar (`onSave`).
    *   **Detalhes:** Similar ao `ExpenseFormDialog`, mas para receitas.

*   **`components/dialogs/UpdateOrderStatusDialog.tsx`**
    *   **Propósito:** Um diálogo para alterar o status de um pedido.
    *   **Conteúdo Principal:**
        *   Utiliza o componente `Select` do Shadcn/ui para permitir a seleção de um novo status.
        *   Recebe props para controlar a abertura/fechamento (`open`, `onOpenChange`), a função de submissão (`onSubmit`), o estado de carregamento (`isSubmitting`) e o status atual (`currentStatus`).
    *   **Detalhes:** Oferece uma interface simples para atualizar o status de um pedido.

### `components/forms/`

Contém os componentes de formulário reais que são usados dentro dos diálogos.

*   **`components/forms/CustomerForm.tsx`**
    *   **Propósito:** O formulário para criar ou editar um cliente.
    *   **Conteúdo Principal:**
        *   Utiliza `react-hook-form` para gerenciamento do estado do formulário e validação.
        *   Integra `zodResolver` com `customerSchema` (de `lib/validations/customer.schema.ts`) para validação de esquema.
        *   Define campos de entrada para detalhes do cliente (e.g., `name`, `email`, `phone`, `is_vip`).
        *   Recebe `onSubmit` como prop para lidar com o envio do formulário.
    *   **Detalhes:** Este é um formulário controlado, com feedback de erro para cada campo.

*   **`components/forms/ExpenseForm.tsx`**
    *   **Propósito:** O formulário para criar ou editar uma despesa.
    *   **Conteúdo Principal:**
        *   Utiliza `react-hook-form` para gerenciamento do estado do formulário e validação.
        *   Integra `zodResolver` com `expenseSchema` (de `lib/validations/expense.schema.ts`) para validação de esquema.
        *   Define campos de entrada para detalhes da despesa (e.g., `description`, `amount`, `category`, `date`).
        *   Recebe `onSubmit` como prop para lidar com o envio do formulário.
    *   **Detalhes:** Este é um formulário controlado, com feedback de erro para cada campo.

*   **`components/forms/OrderForm.tsx`**
    *   **Propósito:** O formulário para criar ou editar um pedido.
    *   **Conteúdo Principal:**
        *   Utiliza `react-hook-form` e `zodResolver` com `orderSchema` (de `lib/validations/order.schema.ts`).
        *   Define campos para `customer_id`, `items` (com `useFieldArray` para múltiplos produtos), `total` e `status`.
        *   Calcula o `total` dinamicamente com base nos itens.
        *   Recebe `onSubmit` como prop.
    *   **Detalhes:** Inclui lógica para adicionar e remover produtos do pedido, e exibe o total calculado.

*   **`components/forms/ProductForm.tsx`**
    *   **Propósito:** O formulário para criar ou editar um produto.
    *   **Conteúdo Principal:**
        *   Utiliza `react-hook-form` e `zodResolver` com `productSchema` (de `lib/validations/product.schema.ts`).
        *   Define campos para `name`, `category`, `price`, `cost`, `stock`, `min_stock`.
        *   Calcula a `Margem de Lucro` dinamicamente.
        *   Recebe `onSubmit` como prop.
    *   **Detalhes:** Permite gerenciar detalhes do produto, incluindo custos e níveis de estoque.

*   **`components/forms/RevenueForm.tsx`**
    *   **Propósito:** O formulário para criar ou editar uma entrada financeira (receita).
    *   **Conteúdo Principal:**
        *   Similar ao `ExpenseForm.tsx`, mas para dados de receita.
        *   Utiliza `react-hook-form` e `zodResolver` com `revenueSchema` (de `lib/validations/revenue.schema.ts`).
        *   Define campos de entrada para detalhes da receita (e.g., `description`, `amount`, `category`, `date`).
        *   Recebe `onSubmit` como prop.
    *   **Detalhes:** Segue o mesmo padrão de formulário controlado e validado.

### `components/ui/`

Este diretório contém os componentes de UI base gerados pelo Shadcn/ui. Estes são componentes "primitivos" que encapsulam estilos e comportamentos básicos, construídos sobre Radix UI e estilizados com Tailwind CSS. Eles são projetados para serem facilmente personalizáveis.

*   **`components/ui/badge.tsx`**
    *   **Propósito:** Um pequeno componente de rótulo ou tag, usado para exibir status, categorias, etc.
    *   **Detalhes:** Define diferentes variantes (e.g., `default`, `secondary`, `destructive`, `outline`) e tamanhos.

*   **`components/ui/button.tsx`**
    *   **Propósito:** Um componente de botão reutilizável.
    *   **Detalhes:** Define várias variantes de estilo (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) e tamanhos (`default`, `sm`, `lg`, `icon`).

*   **`components/ui/card.tsx`**
    *   **Propósito:** Um componente de cartão genérico para agrupar conteúdo.
    *   **Detalhes:** Inclui subcomponentes como `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` e `CardFooter` para estruturar o conteúdo dentro do cartão. O `Card` em si tem estilos de sombra e borda.

*   **`components/ui/dialog.tsx`**
    *   **Propósito:** Componentes para criar diálogos modais (pop-ups).
    *   **Detalhes:** Construído sobre Radix UI, oferece `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` e `DialogClose`.

*   **`components/ui/input.tsx`**
    *   **Propósito:** Um componente de campo de entrada de texto.
    *   **Detalhes:** Estilizado para ter uma aparência consistente em toda a aplicação.

*   **`components/ui/label.tsx`**
    *   **Propósito:** Um componente de rótulo para campos de formulário.
    *   **Detalhes:** Associado a um campo de entrada usando o atributo `htmlFor`.

*   **`components/ui/progress.tsx`**
    *   **Propósito:** Um componente para exibir o progresso de uma tarefa.
    *   **Detalhes:** Recebe um valor numérico e exibe uma barra de progresso.

*   **`components/ui/select.tsx`**
    *   **Propósito:** Um componente de seleção (dropdown).
    *   **Detalhes:** Construído sobre Radix UI, oferece `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectSeparator`.

*   **`components/ui/skeleton.tsx`**
    *   **Propósito:** Um componente de placeholder para indicar que o conteúdo está sendo carregado.
    *   **Detalhes:** Exibe um efeito de "shimmer" para simular o carregamento.

*   **`components/ui/table.tsx`**
    *   **Propósito:** Componentes para criar tabelas de dados.
    *   **Detalhes:** Inclui `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`.

*   **`components/ui/tooltip.tsx`**
    *   **Propósito:** Componentes para exibir dicas de ferramentas (tooltips) ao passar o mouse sobre um elemento.
    *   **Detalhes:** Construído sobre Radix UI, oferece `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`.

### Outros componentes na raiz de `components/`

**Nota:** Os componentes de diálogo listados abaixo são implementações autocontidas com sua própria lógica de formulário e validação. Eles diferem das versões em `components/dialogs/` que atuam como wrappers para os formulários em `components/forms/`. Isso pode indicar a necessidade de refatoração para padronizar o uso de formulários e diálogos.

*   **`components/ExpenseFormDialog.tsx`**
    *   **Propósito:** Diálogo para formulário de despesas.
    *   **Conteúdo Principal:** Implementa um formulário completo para adicionar/editar despesas, incluindo validação Zod e gerenciamento de estado com `react-hook-form`.
    *   **Detalhes:** Define seu próprio `expenseSchema` e utiliza `Select` para categorias.

*   **`components/IngredientFormDialog.tsx`**
    *   **Propósito:** Diálogo para formulário de ingredientes.
    *   **Conteúdo Principal:** Implementa um formulário completo para adicionar/editar ingredientes, incluindo validação Zod e gerenciamento de estado com `react-hook-form`.
    *   **Detalhes:** Define seu próprio `ingredientSchema` e campos para nome, unidade, custo, estoque, etc.

*   **`components/OrderFormDialog.tsx`**
    *   **Propósito:** Diálogo para formulário de pedidos.
    *   **Conteúdo Principal:** Implementa um formulário para adicionar/editar pedidos, utilizando `useState` para gerenciar o estado e `Select` para o status.
    *   **Detalhes:** Exibe informações do cliente e total do pedido (somente leitura).

*   **`components/ProductFormDialog.tsx`**
    *   **Propósito:** Diálogo para formulário de produtos.
    *   **Conteúdo Principal:** Implementa um formulário completo para adicionar/editar produtos, incluindo validação Zod e gerenciamento de estado com `react-hook-form`.
    *   **Detalhes:** Define seu próprio `productSchema` e campos para nome, categoria, preço, custo, estoque e estoque mínimo.

*   **`components/RecipeFormDialog.tsx`**
    *   **Propósito:** Diálogo para formulário de receitas.
    *   **Conteúdo Principal:** Implementa um formulário completo para adicionar/editar receitas, incluindo validação Zod, gerenciamento de estado com `react-hook-form` e `useFieldArray` para ingredientes. Utiliza `useProducts` e `useIngredients` para buscar dados.
    *   **Detalhes:** Define seu próprio `recipeSchema` e `recipeIngredientSchema`.

*   **`components/RevenueFormDialog.tsx`**
    *   **Propósito:** Diálogo para formulário de receitas (entradas financeiras).
    *   **Conteúdo Principal:** Implementa um formulário completo para adicionar/editar receitas financeiras, incluindo validação Zod e gerenciamento de estado com `react-hook-form`.
    *   **Detalhes:** Define seu próprio `revenueSchema` e campos para descrição, quantidade, valor unitário, total e data.
