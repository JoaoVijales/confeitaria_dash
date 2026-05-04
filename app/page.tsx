import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackedLink } from '@/components/landing/TrackedLink'
import {
  Cake,
  ShoppingCart,
  Users,
  Package,
  FlaskConical,
  DollarSign,
  BarChart3,
  Check,
  ClipboardList,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Shield,
  Smartphone,
  Zap,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const painPoints = [
  {
    icon: ClipboardList,
    title: 'Pedidos no caderno ou no WhatsApp',
    description: 'Você perde o controlo de quem pediu o quê, quando e quanto falta produzir.',
  },
  {
    icon: TrendingDown,
    title: 'Não sabe se está tendo lucro',
    description: 'Vende bastante, mas no fim do mês o dinheiro some. O custo real das receitas é um mistério.',
  },
  {
    icon: AlertTriangle,
    title: 'Descobre que faltou ingrediente na hora H',
    description: 'Na véspera da entrega você descobre que não tem manteiga ou chocolate suficiente.',
  },
]

const features = [
  {
    icon: ShoppingCart,
    title: 'Pedidos com status em tempo real',
    description: 'Do recebimento à entrega. Veja tudo pendente, em produção e concluído — sem papel, sem WhatsApp.',
  },
  {
    icon: FlaskConical,
    title: 'Custo automático de receitas',
    description: 'Cadastre seus ingredientes e o sistema calcula automaticamente o custo de cada receita. Saiba exatamente quanto cobrar para ter lucro.',
  },
  {
    icon: Package,
    title: 'Alerta antes do estoque acabar',
    description: 'Defina um estoque mínimo por ingrediente e receba alertas antes de faltar. Nunca mais seja pego de surpresa.',
  },
  {
    icon: DollarSign,
    title: 'Fluxo financeiro completo',
    description: 'Entradas, saídas e despesas em um só lugar. Veja o dinheiro da sua confeitaria em tempo real, sem planilha.',
  },
  {
    icon: Users,
    title: 'Histórico de clientes VIP',
    description: 'Saiba quem compra mais, com que frequência e quanto já gastou. Cultive os melhores clientes com dados.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard com KPIs e gráficos',
    description: 'Faturamento, produtos mais vendidos e tendências em uma tela só. Tome decisões com dados, não com achismo.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Crie sua conta',
    description: 'Cadastro em menos de 2 minutos. Sem burocracia, sem cartão exigido na hora.',
  },
  {
    number: '2',
    title: 'Configure sua confeitaria',
    description: 'Adicione seus produtos, ingredientes e receitas. O sistema calcula os custos automaticamente.',
  },
  {
    number: '3',
    title: 'Gerencie com tranquilidade',
    description: 'Receba pedidos, acompanhe o financeiro e nunca mais perca o controle do seu negócio.',
  },
]

const plans = [
  {
    name: 'Básico',
    price: 'R$ 9,90',
    period: '/mês',
    description: 'Para começar com tudo organizado',
    limits: ['Até 10 produtos', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte por email'],
    cta: 'Assinar agora',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Para confeitarias em crescimento',
    limits: ['Até 50 produtos', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte prioritário'],
    cta: 'Assinar agora',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Max',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Para operações sem limites',
    limits: ['Produtos ilimitados', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte dedicado'],
    cta: 'Assinar agora',
    href: '/signup',
    highlight: false,
  },
]

const faqs = [
  {
    question: 'Preciso instalar algum programa?',
    answer: 'Não. O Confeitando funciona direto no navegador, em qualquer dispositivo — computador, celular ou tablet.',
  },
  {
    question: 'Funciona bem no celular?',
    answer: 'Sim. O dashboard é totalmente responsivo e foi testado em telas pequenas para funcionar bem mesmo na correria do dia a dia.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim. Não existe fidelidade nem multa. Você cancela quando quiser, sem complicação.',
  },
  {
    question: 'Meus dados ficam seguros?',
    answer: 'Seus dados são armazenados com criptografia, com backup automático. Nunca compartilhamos suas informações com terceiros.',
  },
  {
    question: 'E se minha confeitaria crescer?',
    answer: 'É só fazer upgrade de plano. Você migra em segundos e não perde nenhum dado cadastrado.',
  },
]

const trustBadges = [
  { icon: Shield, label: 'Dados criptografados' },
  { icon: Smartphone, label: 'Funciona no celular' },
  { icon: Zap, label: 'Sem instalação' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
              <Cake className="h-6 w-6 text-pink-500" />
              <span>Confeitando</span>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
              <a href="#funcionalidades" className="hover:text-slate-900 transition-colors">Funcionalidades</a>
              <a href="#como-funciona" className="hover:text-slate-900 transition-colors">Como funciona</a>
              <a href="#planos" className="hover:text-slate-900 transition-colors">Planos</a>
              <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-slate-600">
                <TrackedLink href="/login" trackEvent="cta_click" trackParams={{ location: 'navbar', action: 'login' }}>Entrar</TrackedLink>
              </Button>
              <Button asChild className="bg-pink-500 hover:bg-pink-600">
                <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'navbar', action: 'signup' }}>Criar conta</TrackedLink>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-pink-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700 mb-6">
              <Cake className="h-4 w-4" />
              Feito para confeiteiros artesanais
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl leading-tight">
              Sua confeitaria organizada,{' '}
              <span className="text-pink-500">do ingrediente ao caixa</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
              Chega de pedido no caderno e custo no achismo. O Confeitando centraliza
              pedidos, receitas, estoque e financeiro para você produzir com confiança e lucrar de verdade.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className="bg-pink-500 hover:bg-pink-600 px-8 py-6 text-base font-semibold gap-2">
                <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'hero', action: 'signup' }}>
                  Começar agora
                  <ArrowRight className="h-5 w-5" />
                </TrackedLink>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-base">
                <TrackedLink href="/login" trackEvent="cta_click" trackParams={{ location: 'hero', action: 'login' }}>Já tenho conta</TrackedLink>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 text-sm text-slate-500">
                  <badge.icon className="h-4 w-4 text-pink-400" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Isso te parece familiar?
            </h2>
            <p className="mt-3 text-slate-500">Se você se identificou com algum desses cenários, o Confeitando é para você.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {painPoints.map((point) => (
              <div key={point.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 mb-4">
                  <point.icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{point.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Tudo que você precisa, em um lugar só
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
              Módulos integrados que conversam entre si — altere o custo de um ingrediente e o sistema recalcula tudo automaticamente.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-white shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 mb-2">
                    <feature.icon className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-slate-800 text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-500 text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="py-10 bg-white border-y border-pink-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-800 text-lg">Pronta para sair do caderno de vez?</p>
            <p className="text-slate-500 text-sm mt-1">Configure sua confeitaria em menos de 2 minutos.</p>
          </div>
          <Button asChild className="bg-pink-500 hover:bg-pink-600 shrink-0 gap-2">
            <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'mid_features', action: 'signup' }}>
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Simples de começar
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Três passos e sua confeitaria já está organizada.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-[80%] h-px bg-pink-200" />
                )}
                <div className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-slate-800 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild className="bg-pink-500 hover:bg-pink-600 px-8 py-6 text-base font-semibold gap-2">
              <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'como_funciona', action: 'signup' }}>
                Começar agora
                <ArrowRight className="h-5 w-5" />
              </TrackedLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Planos para cada fase da sua confeitaria
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Sem contrato. Cancele quando quiser.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 items-center">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlight
                    ? 'border-pink-500 border-2 shadow-xl scale-105'
                    : 'border-slate-200 shadow-sm'
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
                    <span className="text-slate-500 ml-1 text-sm">{plan.period}</span>
                  </div>
                  <CardDescription className="text-slate-500">{plan.description}</CardDescription>
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
                    <TrackedLink
                      href={plan.href}
                      trackEvent="plan_click"
                      trackParams={{ plano: plan.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), location: 'landing' }}
                    >
                      {plan.cta}
                    </TrackedLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5 cursor-pointer">
                <summary className="flex items-center justify-between gap-4 list-none">
                  <span className="font-medium text-slate-800">{faq.question}</span>
                  <ChevronDown className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-pink-500">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl leading-tight">
            Chega de pedido perdido.<br />Assine e organize tudo agora.
          </h2>
          <p className="mt-4 text-pink-100 text-lg">
            Controle pedidos, custos e estoque em um único lugar. Configure em menos de 2 minutos.
          </p>
          <Button
            size="lg"
            asChild
            className="mt-8 bg-white text-pink-600 hover:bg-pink-50 px-10 py-6 text-base font-semibold gap-2"
          >
            <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'final_cta', action: 'signup' }}>
              Assinar agora
              <ArrowRight className="h-5 w-5" />
            </TrackedLink>
          </Button>
          <p className="mt-4 text-pink-200 text-sm">Sem contrato • Cancele quando quiser</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Cake className="h-5 w-5 text-pink-500" />
              <span>Confeitando</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#funcionalidades" className="hover:text-slate-800 transition-colors">Funcionalidades</a>
              <a href="#planos" className="hover:text-slate-800 transition-colors">Planos</a>
              <a href="#faq" className="hover:text-slate-800 transition-colors">FAQ</a>
              <Link href="/login" className="hover:text-slate-800 transition-colors">Entrar</Link>
              <Link href="/privacidade" className="hover:text-slate-800 transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-slate-800 transition-colors">Termos</Link>
            </nav>
            <p className="text-sm text-slate-400">
              © 2026 Confeitando. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
