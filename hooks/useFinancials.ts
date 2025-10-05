import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getMonthSummary, getTransactions } from '@/app/actions/transactions' // Importar getMonthSummary e getTransactions

const supabase = createClient()

export function useFinancials() {
  return useQuery({
    queryKey: ['financials'],
    queryFn: async () => {
      // Fetch monthly closure data
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
      const currentYear = today.getFullYear();
      const monthlySummary = await getMonthSummary(currentMonth, currentYear);

      // Fetch all revenues and expenses for calculations
      const { data: allRevenues, error: revenuesError } = await supabase.from('revenue_entries').select('total, created_at')
      if (revenuesError) throw revenuesError

      const { data: allExpenses, error: expensesError } = await supabase.from('expense_entries').select('total, category, created_at')
      if (expensesError) throw expensesError

      const totalRevenue = allRevenues.reduce((acc, entry) => acc + entry.total, 0)
      const totalExpenses = allExpenses.reduce((acc, entry) => acc + entry.total, 0)
      const netProfit = totalRevenue - totalExpenses
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      // Data for Revenue vs Expenses chart (last 6 months)
      const revenueVsExpensesData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(today.getMonth() - (5 - i)); // Go back 5 months from current, then iterate forward
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const monthName = d.toLocaleString('default', { month: 'short' });

        const monthlyRevenues = allRevenues
          .filter(r => new Date(r.created_at).getMonth() + 1 === month && new Date(r.created_at).getFullYear() === year)
          .reduce((sum, r) => sum + r.total, 0);

        const monthlyExpenses = allExpenses
          .filter(e => new Date(e.created_at).getMonth() + 1 === month && new Date(e.created_at).getFullYear() === year)
          .reduce((sum, e) => sum + e.total, 0);

        return {
          name: monthName,
          Receitas: monthlyRevenues,
          Despesas: monthlyExpenses,
        };
      });

      // Data for Expenses by Category chart
      const expensesByCategoryData = allExpenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.total;
        return acc;
      }, {} as Record<string, number>);

      const expensesByCategoryChartData = Object.entries(expensesByCategoryData).map(([name, value]) => ({ name, value }));

      // Fetch recent transactions for the table
      const recentTransactions = await getTransactions(
        new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
        new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
      );

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        monthlySummary,
        revenueVsExpensesData,
        expensesByCategoryChartData,
        recentTransactions,
      }
    },
  })
}
