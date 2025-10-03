'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, Package, ShoppingCart, Users, LogOut, Cake } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: 'Visão Geral', icon: Home },
    { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
    { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
    { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
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
                  'flex items-center gap-4 px-4 py-3 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 rounded-r-lg',
                  { 'bg-slate-100 text-pink-600 font-semibold border-l-4 border-pink-500': pathname === item.href }
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-200">
          <Button variant="ghost" size="lg" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
