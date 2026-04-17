'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Cake, Menu, X, Home, Package, ShoppingCart, Users, TrendingUp, ArrowUpCircle, ArrowDownCircle, CreditCard, Wheat, ChefHat, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

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
    <div className="md:hidden">
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800">
          <Cake className="h-6 w-6 text-pink-500" />
          <span>Confeitaria</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir menu">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white pt-16 animate-in slide-in-from-top duration-300">
            <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Fechar menu">
                    <X className="h-6 w-6" />
                </Button>
            </div>
          <nav className="grid gap-2 p-4 text-lg font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-4 rounded-lg px-4 py-3 text-slate-600 transition-all hover:bg-slate-100',
                  { 'bg-pink-50 text-pink-600 font-semibold': pathname === item.href }
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <form action={signOut}>
                    <Button type="submit" variant="ghost" className="w-full justify-start text-lg px-4 py-3 h-auto text-slate-600">
                        <LogOut className="mr-4 h-5 w-5" />
                        Sair
                    </Button>
                </form>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
