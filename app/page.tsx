import Link from 'next/link'
import { Cake, ShoppingCart, Users, Package, FlaskConical, DollarSign, BarChart3, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: ShoppingCart,
    title: 'Gestão de Pedidos',
    description: 'Controle todos os pedidos com status em tempo real, vinculados a clientes e produtos.',
  },
  {
    icon: Users,
    title: 'Clientes VIP',
    description: 'Cadastro completo de clientes com histórico de compras e identificação de clientes especiais.',
  },
  {
    icon: Package,
    title: 'Estoque Inteligente',
    description: 'Alertas automáticos de estoque baixo para ingredientes e produtos finalizados.',
  },
  {
    icon: FlaskConical,
    title: 'Receitas e Custos',
    description: 'Gerencie receitas com cálculo automático de custo por porção baseado nos ingredientes.',
  },
  {
    icon: DollarSign,
    title: 'Fluxo Financeiro',
    description: 'Controle de entradas, saídas e despesas com visão consolidada do financeiro.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e KPIs',
    description: 'Dashboard com gráficos de vendas, produtos mais vendidos e indicadores de desempenho.',
  },
]

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Ideal para começar',
    limits: ['Até 30 produtos', 'Até 50 pedidos/mês', 'Todos os módulos', 'Suporte por email'],
    cta: 'Começar grátis',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Básico',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para confeitarias em crescimento',
    limits: ['Até 200 produtos', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte prioritário'],
    cta: 'Assinar Básico',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'R$ 99',
    period: '/mês',
    description: 'Para operações completas',
    limits: ['Produtos ilimitados', 'Pedidos ilimitados', 'Analytics avançado', 'Suporte dedicado'],
    cta: 'Assinar Pro',
    href: '/signup',
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Cake className="h-6 w-6 text-pink-500" />
              <span>Confeitaria</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-pink-500 hover:bg-pink-600">
                <Link href="/signup">Começar grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-pink-50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Gerencie sua confeitaria com{' '}
              <span className="text-pink-500">eficiência</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Dashboard completo para confeitarias artesanais. Controle pedidos, clientes,
              estoque, receitas e financeiro em um só lugar.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className="bg-pink-500 hover:bg-pink-600 px-8 py-6 text-base">
                <Link href="/signup">Começar grátis agora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-base">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Sem cartão de crédito • Plano gratuito para sempre
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Tudo que você precisa em um lugar
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              Módulos integrados para a gestão completa da sua confeitaria.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 mb-2">
                    <feature.icon className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-slate-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Planos simples e transparentes
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              Comece grátis e faça upgrade quando precisar crescer.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlight
                    ? 'border-pink-500 border-2 shadow-lg scale-105'
                    : 'border-slate-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-slate-800">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="text-slate-600">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.limits.map((limit) => (
                      <li key={limit} className="flex items-center gap-2 text-slate-700 text-sm">
                        <Check className="h-4 w-4 text-pink-500 flex-shrink-0" />
                        {limit}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full mt-4 ${
                      plan.highlight
                        ? 'bg-pink-500 hover:bg-pink-600'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-pink-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Pronto para organizar sua confeitaria?
          </h2>
          <p className="mt-4 text-pink-100 text-lg">
            Junte-se a confeiteiros que já usam o nosso dashboard.
          </p>
          <Button size="lg" asChild className="mt-8 bg-white text-pink-600 hover:bg-pink-50 px-8 py-6 text-base font-semibold">
            <Link href="/signup">Criar conta grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Cake className="h-5 w-5 text-pink-500" />
              <span className="font-medium">Confeitaria Dashboard</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2025 Confeitaria Dashboard. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
