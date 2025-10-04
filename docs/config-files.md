## Arquivos de Configuração e Outros na Raiz

*   **`.gitignore`**
    *   **Propósito:** Lista de arquivos e diretórios que o Git deve ignorar, ou seja, que não devem ser rastreados pelo controle de versão.
    *   **Detalhes:** Inclui diretórios gerados automaticamente como `node_modules`, `.next`, arquivos de log, etc.

*   **`components.json`**
    *   **Propósito:** Arquivo de configuração para o Shadcn/ui.
    *   **Detalhes:** Define como os componentes do Shadcn/ui são gerados e onde eles são colocados no projeto. Pode incluir configurações de tema, aliases de importação, etc.

*   **`eslint.config.mjs`**
    *   **Propósito:** Configuração do ESLint para linting de código.
    *   **Detalhes:** Garante padrões de estilo consistentes, identifica possíveis erros e problemas de qualidade de código. A extensão `.mjs` indica que é um módulo ES.

*   **`middleware.ts`**
    *   **Propósito:** Middleware do Next.js.
    *   **Detalhes:** Pode interceptar requisições antes que elas cheguem às rotas, sendo útil para autenticação, redirecionamentos, manipulação de headers, etc.

*   **`next-env.d.ts`**
    *   **Propósito:** Arquivo de declaração de tipos gerado automaticamente pelo Next.js.
    *   **Detalhes:** Fornece definições de tipo para o ambiente Next.js, como variáveis de ambiente e tipos específicos do framework.

*   **`next.config.ts`**
    *   **Propósito:** Configuração principal do Next.js.
    *   **Detalhes:** Onde você pode definir configurações como `output` (para exportação estática), `images` (otimização de imagens), `webpack` (configurações personalizadas do Webpack), `env` (variáveis de ambiente), etc.

*   **`package.json`**
    *   **Propósito:** Contém metadados do projeto e gerencia as dependências.
    *   **Detalhes:** Inclui o nome e versão do projeto, scripts para execução de tarefas (e.g., `dev`, `build`, `start`, `lint`), e listas de `dependencies` (pacotes necessários para o funcionamento da aplicação) e `devDependencies` (pacotes necessários apenas para desenvolvimento).

*   **`postcss.config.mjs`**
    *   **Propósito:** Configuração do PostCSS.
    *   **Detalhes:** Usado para processar CSS, especialmente em conjunto com Tailwind CSS para adicionar prefixos de vendor, otimizações, etc.

*   **`prompt.md`**
    *   **Propósito:** (Este arquivo, provavelmente um rascunho, anotações ou instruções específicas para o desenvolvimento ou para o modelo de IA).

*   **`README.md`**
    *   **Propósito:** Arquivo de documentação geral do projeto.
    *   **Detalhes:** Geralmente contém instruções de setup, como rodar o projeto, uma visão geral das funcionalidades e informações de contato.

*   **`tailwind.config.ts`**
    *   **Propósito:** Configuração do Tailwind CSS.
    *   **Detalhes:** Onde você pode estender o tema padrão do Tailwind, adicionar plugins, configurar variantes, e personalizar classes utilitárias.

*   **`tsconfig.json`**
    *   **Propósito:** Configuração do TypeScript para o projeto.
    *   **Detalhes:** Define opções do compilador TypeScript (e.g., `target`, `module`, `jsx`), caminhos de inclusão/exclusão de arquivos, e outras configurações relacionadas ao TypeScript.

*   **`yarn.lock`**
    *   **Propósito:** Arquivo de bloqueio de dependências gerado pelo Yarn.
    *   **Detalhes:** Garante que as instalações de dependências sejam consistentes entre diferentes ambientes de desenvolvimento e produção, registrando as versões exatas de cada pacote instalado.
