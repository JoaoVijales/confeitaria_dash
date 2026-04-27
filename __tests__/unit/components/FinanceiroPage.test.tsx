import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FinanceiroPage from '@/app/dashboard/financeiro/page'
import { useFinancials } from '@/hooks/useFinancials'

vi.mock('@/hooks/useFinancials', () => ({
  useFinancials: vi.fn(),
}))

vi.mock('recharts', () => ({
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
}))

const mockFinancials = {
  totalRevenue: 5000,
  totalExpenses: 2000,
  netProfit: 3000,
  profitMargin: 60,
  revenueVsExpensesData: [
    { name: 'jan', Receitas: 1000, Despesas: 400 },
  ],
  expensesByCategoryChartData: [
    { name: 'Ingredientes', value: 1500 },
  ],
  monthlySummary: null,
  recentTransactions: [
    { id: '1', date: '2026-04-10', description: 'Venda de bolo', total: 150, type: 'Receita' as const, category: null },
    { id: '2', date: '2026-04-08', description: 'Farinha', total: -30, type: 'Despesa' as const, category: 'Ingredientes' },
  ],
}

describe('FinanceiroPage', () => {
  it('exibe KPI cards com dados financeiros', () => {
    ;(useFinancials as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockFinancials,
      isLoading: false,
      error: null,
    })

    render(<FinanceiroPage />)

    expect(screen.getByText('Receita Total')).toBeInTheDocument()
    expect(screen.getByText('Despesas Totais')).toBeInTheDocument()
    expect(screen.getByText('Lucro Líquido')).toBeInTheDocument()
  })

  it('exibe transações recentes na tabela', () => {
    ;(useFinancials as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockFinancials,
      isLoading: false,
      error: null,
    })

    render(<FinanceiroPage />)

    expect(screen.getByText('Venda de bolo')).toBeInTheDocument()
    expect(screen.getByText('Farinha')).toBeInTheDocument()
  })

  it('exibe skeleton durante carregamento', () => {
    ;(useFinancials as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<FinanceiroPage />)

    const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('exibe EmptyState quando ha erro', () => {
    ;(useFinancials as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Falha na requisição'),
    })

    render(<FinanceiroPage />)

    expect(screen.getByText(/erro ao carregar dados financeiros/i)).toBeInTheDocument()
  })
})
