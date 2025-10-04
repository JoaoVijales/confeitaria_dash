## `app/`

Este é o diretório raiz da aplicação Next.js, utilizando o App Router. Ele contém as rotas principais, layouts globais, estilos e configurações de provedores.

*   **`app/layout.tsx`**
    *   **Propósito:** Define o layout raiz da aplicação, que envolve todas as páginas. Inclui a estrutura HTML básica, importação de estilos globais e o componente `Providers`.
    *   **Conteúdo Principal:**
        *   Importa `globals.css` para estilos globais.
        *   Importa `Providers` (de `app/providers.tsx`) para envolver a aplicação com contextos como React Query.
        *   Define a estrutura `<html>` e `<body>`.
        *   Configura a fonte (`font-sans`).
        *   Define `metadata` para o título da página e descrição.
    *   **Detalhes:**
        *   `lang="pt-BR"`: Define o idioma da página.
        *   `suppressHydrationWarning`: Usado para evitar avisos de hidratação, comum com bibliotecas de UI que manipulam o DOM no cliente.
        *   O `<body>` aplica classes Tailwind para fonte e cores de fundo.

*   **`app/page.tsx`**
    *   **Propósito:** A página inicial da aplicação (rota `/`). Atualmente, parece ser uma página de placeholder ou redirecionamento, pois o dashboard é a rota principal após a autenticação.
    *   **Conteúdo Principal:**
        *   Exporta um componente React simples que renderiza um `div` com "Hello World".
    *   **Detalhes:** Em uma aplicação real, esta página poderia ser uma landing page, uma página de login/registro, ou redirecionar para o dashboard se o usuário já estiver autenticado.

*   **`app/globals.css`**
    *   **Propósito:** Contém os estilos CSS globais da aplicação. Geralmente inclui importações do Tailwind CSS e quaisquer estilos base personalizados.
    *   **Conteúdo Principal:**
        *   Importações do Tailwind CSS (`tailwindcss/base`, `tailwindcss/components`, `tailwindcss/utilities`).
        *   Pode conter estilos CSS personalizados que se aplicam globalmente.

*   **`app/favicon.ico`**
    *   **Propósito:** O ícone da aba do navegador para a aplicação.

*   **`app/providers.tsx`**
    *   **Propósito:** Centraliza a configuração de provedores de contexto que precisam envolver toda a aplicação ou grandes partes dela. Neste caso, é usado para configurar o `QueryClientProvider` do React Query.
    *   **Conteúdo Principal:**
        *   Importa `QueryClient` e `QueryClientProvider` do `@tanstack/react-query`.
        *   Cria uma instância de `QueryClient`.
        *   Exporta um componente `Providers` que envolve `children` com o `QueryClientProvider`.
    *   **Detalhes:** Este é um padrão comum no React para evitar "prop drilling" e disponibilizar estados ou funcionalidades para toda a árvore de componentes.
