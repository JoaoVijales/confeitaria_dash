'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, Package, ShoppingCart, Users, LogOut, Cake, TrendingUp, ArrowUpCircle, ArrowDownCircle, CreditCard, Wheat, ChefHat } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { usePlan } from '@/hooks/usePlan'

export function Sidebar() {
  const pathname = usePathname()
  const { data: planData } = usePlan()

  const navItems = [
    { href: '/dashboard', label: 'Visão Geral', icon: Home },
    { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
    { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
    { href: '/dashboard/ingredientes', label: 'Ingredientes', icon: Wheat },
    { href: '/dashboard/receitas', label: 'Receitas', icon: ChefHat },
    { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
    { href: '/dashboard/financeiro', label: 'Financeiro', icon: TrendingUp },
    { href: '/dashboard/entradas', label: 'Entradas', icon: ArrowUpCircle },
    { href: '/dashboard/saidas', label: 'Saídas', icon: ArrowDownCircle },
    { href: '/dashboard/billing', label: 'Plano & Billing', icon: CreditCard },
  ]

  return (
    <div className="hidden md:block bg-white border-r border-slate-200 shadow-sm">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-20 items-center px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3 font-semibold text-lg text-slate-800">
            <Cake className="h-6 w-6 text-pink-500" />
            <span>Confeitaria</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start gap-2 p-4 text-base font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg',
                  { 'bg-slate-100 text-pink-600 font-semibold border-l-4 border-pink-500': pathname === item.href }
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Upgrade banner for free plan */}
        {planData?.plan === 'free' && (
          <div className="mx-4 mb-2 rounded-lg bg-pink-50 border border-pink-200 p-3">
            <p className="text-xs font-semibold text-pink-700">Plano Gratuito</p>
            <p className="text-xs text-pink-600 mt-0.5">
              {planData.limits.maxProducts} produtos, {planData.limits.maxOrdersPerMonth} pedidos/mês
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-2 block text-xs font-semibold text-pink-700 hover:underline"
            >
              Fazer upgrade →
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-slate-200">
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="lg" className="w-full justify-start">
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
