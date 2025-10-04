PROMPT: Integração Supabase - Listar Dados

Integre Supabase para exibir dados reais:

CLIENTES SUPABASE (lib/supabase/)
- server.ts: createServerClient
- client.ts: createBrowserClient

SERVER ACTIONS (app/actions/)

transactions.ts:
export async function getTransactions(startDate, endDate)
export async function getMonthSummary(month, year)

revenues.ts:
export async function getRevenues()
export async function getTotalRevenue(period)

expenses.ts:
export async function getExpenses()
export async function getExpensesByCategory()

HOOKS (hooks/)

useTransactions.ts:
- useQuery para listar transações
- filtros por período

useRevenues.ts:
- useQuery para entradas
- totalizadores

useExpenses.ts:
- useQuery para despesas
- agrupamento por categoria

ATUALIZAR PÁGINAS

Visão Geral:
- Substituir dados mock pelos hooks
- Processar dados para gráficos
- Exibir loading states

Financeiro:
- useTransactions para tabela
- useExpensesByCategory para pizza
- Cálculos dinâmicos

Entradas/Saídas:
- useRevenues/useExpenses
- Filtros funcionais
- Paginação

PROVIDER (app/providers.tsx)
- Configurar QueryClientProvider
- Envolver layout

PROMPT: CRUD Transações Financeiras

Implemente formulários e mutations completos:

SERVER ACTIONS (app/actions/)

revenues.ts - adicionar:
export async function createRevenue(formData)
export async function updateRevenue(id, data)
export async function deleteRevenue(id)

expenses.ts - adicionar:
export async function createExpense(formData)
export async function updateExpense(id, data)
export async function deleteExpense(id)

VALIDAÇÕES (lib/validations/)

revenue.schema.ts:
- Zod schema para validar entradas
- date, description, quantity, unit_price required

expense.schema.ts:
- Similar + category required

FORMULÁRIOS (components/forms/)

RevenueForm.tsx:
- Campos: data, descrição, quantidade, valor unitário
- Cálculo automático do total
- Validação com Zod
- Submit com Server Action

ExpenseForm.tsx:
- Campos + categoria (select)
- Categorias: Ingredientes, Embalagens, Utensílios, Outros

MUTATIONS (hooks/)

useMutations.ts:
- useCreateRevenue
- useUpdateRevenue
- useDeleteRevenue
- useCreateExpense
- useUpdateExpense
- useDeleteExpense
- Invalidar queries após mutação

MODALS/DIALOGS (components/dialogs/)
- Dialog shadcn/ui para formulários
- Confirmação de delete
- Toast notifications

PÁGINAS - Adicionar:
- Botão ação abre modal
- Loading durante submit
- Feedback visual sucesso/erro
- Atualização otimista da lista