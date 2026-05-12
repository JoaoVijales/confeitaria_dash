'use client'

import Image from 'next/image'
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
import { WhatsAppIcon, WHATSAPP_URL } from '@/components/SupportButton'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

// ─── Reusable animation primitives ─────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function FadeIn({
  children,
  delay = 0,
  className,
  direction = 'up',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'left' | 'right' | 'none'
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const dirMap = { up: [0, 56], left: [-64, 0], right: [64, 0], none: [0, 0] }
  const [x, y] = dirMap[direction]
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.22, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

// ─── Magnetic hover button ──────────────────────────────────────────────────

function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({ x: (e.clientX - cx) * 0.22, y: (e.clientY - cy) * 0.22 })
  }
  function handleMouseLeave() {
    setPos({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Tilt card ──────────────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -10, y: px * 10 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: hovered ? 1.02 : 1,
        boxShadow: hovered
          ? '0 20px 60px -15px rgba(236,72,153,0.2), 0 8px 24px -8px rgba(0,0,0,0.12)'
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}
      transition={{ type: 'spring', stiffness: 160, damping: 26 }}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Data ───────────────────────────────────────────────────────────────────

const painPoints = [
  {
    icon: ClipboardList,
    title: 'Pedidos no caderno ou no WhatsApp',
    description: 'Você perde o controle de quem pediu o quê, quando e quanto falta produzir.',
    color: 'bg-pink-50',
    iconColor: 'text-pink-500',
    stripe: 'bg-pink-400',
  },
  {
    icon: TrendingDown,
    title: 'Não sabe se está tendo lucro',
    description: 'Vende bastante, mas no fim do mês o dinheiro some. O custo real das receitas é um mistério.',
    color: 'bg-rose-50',
    iconColor: 'text-rose-500',
    stripe: 'bg-rose-400',
  },
  {
    icon: AlertTriangle,
    title: 'Descobre que faltou ingrediente na hora H',
    description: 'Na véspera da entrega você descobre que não tem manteiga ou chocolate suficiente.',
    color: 'bg-pink-50',
    iconColor: 'text-pink-600',
    stripe: 'bg-pink-300',
  },
]

const features = [
  { icon: ShoppingCart, title: 'Pedidos com status em tempo real', description: 'Do recebimento à entrega. Veja tudo pendente, em produção e concluído — sem papel, sem WhatsApp.' },
  { icon: FlaskConical, title: 'Custo automático de receitas', description: 'Cadastre seus ingredientes e o sistema calcula automaticamente o custo de cada receita. Saiba exatamente quanto cobrar para ter lucro.' },
  { icon: Package, title: 'Alerta antes do estoque acabar', description: 'Defina um estoque mínimo por ingrediente e receba alertas antes de faltar. Nunca mais seja pego de surpresa.' },
  { icon: DollarSign, title: 'Fluxo financeiro completo', description: 'Entradas, saídas e despesas em um só lugar. Veja o dinheiro da sua confeitaria em tempo real, sem planilha.' },
  { icon: Users, title: 'Histórico de clientes VIP', description: 'Saiba quem compra mais, com que frequência e quanto já gastou. Cultive os melhores clientes com dados.' },
  { icon: BarChart3, title: 'Dashboard com KPIs e gráficos', description: 'Faturamento, produtos mais vendidos e tendências em uma tela só. Tome decisões com dados, não com achismo.' },
]

const steps = [
  { number: '1', title: 'Crie sua conta', description: 'Cadastro em menos de 2 minutos. Sem burocracia, sem cartão exigido na hora.' },
  { number: '2', title: 'Configure sua confeitaria', description: 'Adicione seus produtos, ingredientes e receitas. O sistema calcula os custos automaticamente.' },
  { number: '3', title: 'Gerencie com tranquilidade', description: 'Receba pedidos, acompanhe o financeiro e nunca mais perca o controle do seu negócio.' },
]

const plans = [
  { name: 'Básico', price: 'R$ 9,90', period: '/mês', description: 'Para começar com tudo organizado', limits: ['Até 10 produtos', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte por email'], cta: 'Assinar agora', href: '/signup', highlight: false },
  { name: 'Pro', price: 'R$ 49,90', period: '/mês', description: 'Para confeitarias em crescimento', limits: ['Até 50 produtos', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte prioritário'], cta: 'Assinar agora', href: '/signup', highlight: true },
  { name: 'Max', price: 'R$ 99,90', period: '/mês', description: 'Para operações sem limites', limits: ['Produtos ilimitados', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte dedicado'], cta: 'Assinar agora', href: '/signup', highlight: false },
]

const faqs = [
  { question: 'Preciso instalar algum programa?', answer: 'Não. O Confeitando funciona direto no navegador, em qualquer dispositivo — computador, celular ou tablet.' },
  { question: 'Funciona bem no celular?', answer: 'Sim. O dashboard é totalmente responsivo e foi testado em telas pequenas para funcionar bem mesmo na correria do dia a dia.' },
  { question: 'Posso cancelar quando quiser?', answer: 'Sim. Não existe fidelidade nem multa. Você cancela quando quiser, sem complicação.' },
  { question: 'Meus dados ficam seguros?', answer: 'Seus dados são armazenados com criptografia, com backup automático. Nunca compartilhamos suas informações com terceiros.' },
  { question: 'E se minha confeitaria crescer?', answer: 'É só fazer upgrade de plano. Você migra em segundos e não perde nenhum dado cadastrado.' },
]

const trustBadges = [
  { icon: Shield, label: 'Dados criptografados' },
  { icon: Smartphone, label: 'Funciona no celular' },
  { icon: Zap, label: 'Sem instalação' },
]

const flowItems = [
  { label: 'Ingredientes', color: 'bg-blue-100 text-blue-700', desc: 'preço e estoque' },
  { label: 'Receitas', color: 'bg-purple-100 text-purple-700', desc: 'custo automático' },
  { label: 'Produtos', color: 'bg-pink-100 text-pink-700', desc: 'margem em tempo real' },
  { label: 'Pedidos', color: 'bg-orange-100 text-orange-700', desc: 'status e entrega' },
  { label: 'Financeiro', color: 'bg-green-100 text-green-700', desc: 'caixa atualizado' },
] as const

// ─── Main component ─────────────────────────────────────────────────────────

export function LandingPageContent() {
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })

  // Parallax layers — each moves at a different speed as hero scrolls out
  const heroBgY    = useTransform(heroScroll, [0, 1], ['0%', '55%'])   // slowest: background
  const blobFarY   = useTransform(heroScroll, [0, 1], ['0%', '35%'])   // far blobs
  const blobNearY  = useTransform(heroScroll, [0, 1], ['0%', '20%'])   // near blob
  const heroTextY  = useTransform(heroScroll, [0, 1], ['0%', '12%'])   // text moves a little
  const heroImgY   = useTransform(heroScroll, [0, 1], ['0%', '22%'])   // image moves more than text
  const heroOpacity = useTransform(heroScroll, [0, 0.55], [1, 0])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <motion.header
        className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="flex items-center gap-2 font-bold text-slate-800 text-lg"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Cake className="h-6 w-6 text-pink-500" />
              </motion.div>
              <span>Confeitando</span>
            </motion.div>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
              {['#funcionalidades', '#como-funciona', '#planos', '#faq'].map((href, i) => (
                <motion.a
                  key={href}
                  href={href}
                  className="hover:text-slate-900 transition-colors relative group"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.18, duration: 1.1 }}
                >
                  {['Funcionalidades', 'Como funciona', 'Planos', 'FAQ'][i]}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-pink-400 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </nav>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 1.1 }}
            >
              <Button variant="ghost" asChild className="text-slate-600">
                <TrackedLink href="/login" trackEvent="cta_click" trackParams={{ location: 'navbar', action: 'login' }}>Entrar</TrackedLink>
              </Button>
              <MagneticButton>
                <Button asChild className="bg-pink-500 hover:bg-pink-600">
                  <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'navbar', action: 'signup' }}>Criar conta</TrackedLink>
                </Button>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden py-16 sm:py-20 lg:py-24 min-h-[88vh] flex items-center">
        {/* Parallax background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-pink-50/70 via-pink-50/30 to-white"
          style={{ y: heroBgY }}
        />

        {/* Parallax blob layer — far (slow) */}
        <motion.div style={{ y: blobFarY }} className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-16 right-[8%] w-80 h-80 rounded-full bg-pink-200/30 blur-3xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.28, 0.48, 0.28] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-40 left-[12%] w-48 h-48 rounded-full bg-rose-200/20 blur-3xl"
            animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </motion.div>

        {/* Parallax blob layer — near (faster) */}
        <motion.div style={{ y: blobNearY }} className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute bottom-24 left-[4%] w-56 h-56 rounded-full bg-purple-200/25 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.42, 0.25] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
          <motion.div
            className="absolute bottom-32 right-[18%] w-36 h-36 rounded-full bg-pink-300/20 blur-2xl"
            animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full"
          style={{ opacity: heroOpacity, y: heroTextY }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-10 items-center">

            {/* ── Left: text ── */}
            <div className="text-center lg:text-left">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700 mb-6"
                initial={{ opacity: 0, y: -24, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  animate={{ rotate: [0, -12, 12, -12, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Cake className="h-4 w-4" />
                </motion.span>
                Feito para confeiteiros artesanais
              </motion.div>

              <motion.h1
                className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight"
                initial={{ opacity: 0, y: 52 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Sua confeitaria organizada,{' '}
                <motion.span
                  className="text-pink-500 inline-block"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.3, delay: 0.85 }}
                >
                  do ingrediente ao caixa
                </motion.span>
              </motion.h1>

              <motion.p
                className="mt-6 text-lg leading-8 text-slate-600 max-w-xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.7 }}
              >
                Chega de pedido no caderno e custo no achismo. O Confeitando centraliza
                pedidos, receitas, estoque e financeiro para você produzir com confiança e lucrar de verdade.
              </motion.p>

              <motion.div
                className="mt-10 flex items-center justify-center lg:justify-start gap-4 flex-wrap"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.3, delay: 1.0 }}
              >
                <MagneticButton>
                  <Button size="lg" asChild className="bg-pink-500 hover:bg-pink-600 px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-shadow">
                    <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'hero', action: 'signup' }}>
                      Começar agora
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </TrackedLink>
                  </Button>
                </MagneticButton>
                <Button size="lg" variant="outline" asChild className="px-8 py-6 text-base hover:border-pink-300 transition-colors">
                  <TrackedLink href="/login" trackEvent="cta_click" trackParams={{ location: 'hero', action: 'login' }}>Já tenho conta</TrackedLink>
                </Button>
              </motion.div>

              <motion.div
                className="mt-8 flex items-center justify-center lg:justify-start gap-6 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.3 }}
              >
                {trustBadges.map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    className="flex items-center gap-1.5 text-sm text-slate-500"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + i * 0.18, duration: 1.1 }}
                  >
                    <badge.icon className="h-4 w-4 text-pink-400" />
                    {badge.label}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: multi-screen composition ── */}
            <motion.div
              className="relative flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, y: 64, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: heroImgY }}
            >
              {/* Ambient glow */}
              <motion.div
                className="absolute inset-0 -m-12 rounded-[40px] bg-pink-200/35 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Dot grid decoration — back layer */}
              <div
                className="absolute -bottom-4 -left-4 w-36 h-36 opacity-[0.15] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #f472b6 1.5px, transparent 1.5px)',
                  backgroundSize: '14px 14px',
                }}
              />

              {/* ── Composition wrapper ── */}
              <div className="relative w-full max-w-[480px]">

                {/* Floating card: Pedidos — top right */}
                <motion.div
                  className="absolute -top-8 -right-4 z-20 w-48 rounded-xl bg-white border border-slate-200/80 shadow-xl overflow-hidden"
                  style={{ rotate: -3 }}
                  initial={{ opacity: 0, x: 24, y: -16 }}
                  animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                  transition={{
                    opacity: { duration: 1.1, delay: 2.0 },
                    x: { duration: 1.1, delay: 2.0 },
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2.2, times: [0, 0.5, 1] },
                  }}
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-orange-50">
                    <ShoppingCart className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-700">Pedidos</span>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    {[
                      { name: 'Bolo de cenoura', status: 'Entregue', dot: 'bg-green-400' },
                      { name: 'Torta de limão', status: 'Produção', dot: 'bg-yellow-400' },
                      { name: 'Brownie 6un', status: 'Pendente', dot: 'bg-slate-300' },
                    ].map((row) => (
                      <div key={row.name} className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-600 truncate">{row.name}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${row.dot}`} />
                          <span className="text-[9px] text-slate-400">{row.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating card: Financeiro — bottom left */}
                <motion.div
                  className="absolute -bottom-6 -left-4 z-20 w-40 rounded-xl bg-white border border-slate-200/80 shadow-xl overflow-hidden"
                  style={{ rotate: 2.5 }}
                  initial={{ opacity: 0, x: -20, y: 16 }}
                  animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
                  transition={{
                    opacity: { duration: 1.1, delay: 2.3 },
                    x: { duration: 1.1, delay: 2.3 },
                    y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5, times: [0, 0.5, 1] },
                  }}
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-green-50">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Financeiro</span>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[9px] text-slate-400 mb-0.5">Saldo atual</p>
                    <p className="text-base font-bold text-slate-800">R$ 3.240</p>
                    {/* Mini bar chart */}
                    <div className="flex items-end gap-0.5 mt-2 h-6">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-pink-400 rounded-sm"
                          style={{ height: `${h}%` }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.5, delay: 2.5 + i * 0.07, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Main dashboard browser mockup */}
                <motion.div
                  className="relative rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden"
                  style={{ rotate: 1 }}
                  whileHover={{ rotate: 0, scale: 1.012, boxShadow: '0 36px 80px -20px rgba(236,72,153,0.22)' }}
                  transition={{ type: 'spring', stiffness: 150, damping: 26 }}
                >
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <motion.span className="h-3 w-3 rounded-full bg-red-400" whileHover={{ scale: 1.3 }} />
                    <motion.span className="h-3 w-3 rounded-full bg-yellow-400" whileHover={{ scale: 1.3 }} />
                    <motion.span className="h-3 w-3 rounded-full bg-green-400" whileHover={{ scale: 1.3 }} />
                    <div className="ml-4 flex-1 rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400 text-left max-w-xs">
                      app.confeitando.com.br
                    </div>
                  </div>
                  <div className="relative overflow-hidden">
                    <img
                      src="/hero-bg.png"
                      alt="Dashboard do Confeitando — visão geral financeira"
                      className="w-full h-auto block"
                      loading="eager"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.6, delay: 1.4, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* Pain points */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Isso te parece familiar?
            </h2>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {painPoints.map((point) => (
              <motion.div key={point.title} variants={staggerItem}>
                <TiltCard className="h-full rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                  {/* colored top stripe */}
                  <div className={`h-1.5 w-full ${point.stripe}`} />
                  <div className="p-7">
                    <motion.div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${point.color} mb-5`}
                      whileHover={{ rotate: [-4, 4, -4, 0], scale: 1.08 }}
                      transition={{ duration: 0.5 }}
                    >
                      <point.icon className={`h-6 w-6 ${point.iconColor}`} />
                    </motion.div>
                    <h3 className="font-bold text-slate-800 text-base mb-3">{point.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 relative overflow-hidden">
        <ScrollBgLayer className="bg-slate-50" speed={0.12} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Tudo que você precisa, em um lugar só
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
              Módulos integrados que conversam entre si — altere o custo de um ingrediente e o sistema recalcula tudo automaticamente.
            </p>
          </FadeUp>
          {/* Featured card + remaining grid */}
          <StaggerContainer className="space-y-5">
            {/* Destaque: custo automático */}
            <motion.div variants={staggerItem}>
              <TiltCard className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white overflow-hidden shadow-xl shadow-pink-200">
                <div className="p-8 sm:flex items-center gap-8">
                  <div className="flex-shrink-0 mb-6 sm:mb-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <FlaskConical className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-pink-100 mb-2 block">Funcionalidade principal</span>
                    <h3 className="text-xl font-bold text-white mb-2">Custo automático de receitas</h3>
                    <p className="text-pink-100 leading-relaxed text-sm max-w-2xl">
                      Cadastre seus ingredientes e o sistema calcula automaticamente o custo de cada receita — por grama, mililitro ou unidade. Atualizou o preço da manteiga? Todos os produtos que a usam recalculam na hora.
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-6 sm:mt-0">
                    <div className="rounded-xl bg-white/10 border border-white/20 px-5 py-4 text-center min-w-[120px]">
                      <p className="text-xs text-pink-100 mb-1">Economia de tempo</p>
                      <p className="text-3xl font-bold text-white">100%</p>
                      <p className="text-xs text-pink-100 mt-1">de cálculo manual</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
            {/* Remaining 5 features */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.filter(f => f.icon !== FlaskConical).map((feature) => (
                <motion.div key={feature.title} variants={staggerItem}>
                  <TiltCard className="rounded-xl border border-slate-200 shadow-sm bg-white h-full">
                    <div className="p-6">
                      <motion.div
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 mb-4"
                        whileHover={{ scale: 1.12, backgroundColor: '#fce7f3' }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <feature.icon className="h-5 w-5 text-pink-600" />
                      </motion.div>
                      <h3 className="font-semibold text-slate-800 mb-2 text-sm">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Mid-page CTA — gradient band */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500" />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          animate={{ backgroundPositionX: ['0px', '32px'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <FadeUp className="relative z-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <p className="text-xl font-bold text-white">Pronta para sair do caderno de vez?</p>
              <p className="text-pink-100 text-sm mt-1">Configure sua confeitaria em menos de 2 minutos. Sem cartão.</p>
            </div>
            <MagneticButton>
              <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-50 shrink-0 gap-2 font-semibold shadow-xl shadow-rose-700/30">
                <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'mid_features', action: 'signup' }}>
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </TrackedLink>
              </Button>
            </MagneticButton>
          </div>
        </FadeUp>
      </section>

      {/* Demo screenshots */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700 mb-4">
              <Zap className="h-4 w-4" />
              Módulos integrados
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Veja como fica na prática
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
              Os módulos conversam entre si em tempo real. Altere o preço de um ingrediente
              e o custo de todas as receitas e produtos atualiza automaticamente.
            </p>
          </FadeUp>

          {/* Receitas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <FadeIn direction="left">
              <ParallaxImage src="/receitas_conf.png" alt="Tela de receitas do Confeitando" speed={0.12} />
            </FadeIn>
            <FadeIn direction="right" delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 mb-4">
                <FlaskConical className="h-3.5 w-3.5" />
                Módulo de Receitas
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Custo exato de cada receita, sem fazer conta
              </h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Liste os ingredientes e as quantidades que você já usa. O Confeitando soma os preços por grama, mililitro ou unidade e mostra o custo total da receita — e quanto custa cada porção individualmente.
              </p>
              <StaggerContainer className="space-y-4">
                {[
                  { color: 'bg-purple-100', iconColor: 'text-purple-600', strong: 'Unidades reais', text: '— cadastre em g, ml ou unidade; o sistema converte para o custo exato por porção' },
                  { color: 'bg-purple-100', iconColor: 'text-purple-600', strong: 'Recalculo automático', text: '— atualizou o preço do chocolate? Todas as receitas que levam chocolate atualizam' },
                  { color: 'bg-purple-100', iconColor: 'text-purple-600', strong: 'Base para precificação', text: '— saiba o mínimo que você pode cobrar para não vender no prejuízo' },
                ].map((item) => (
                  <motion.li key={item.strong} className="flex items-start gap-3 list-none" variants={staggerItem}>
                    <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full ${item.color} flex items-center justify-center`}>
                      <Check className={`h-3 w-3 ${item.iconColor}`} />
                    </div>
                    <span className="text-sm text-slate-600 leading-relaxed">
                      <strong className="text-slate-700">{item.strong}</strong> {item.text}
                    </span>
                  </motion.li>
                ))}
              </StaggerContainer>
            </FadeIn>
          </div>

          {/* Produtos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <FadeIn direction="left" className="order-2 lg:order-1" delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700 mb-4">
                <Package className="h-3.5 w-3.5" />
                Módulo de Produtos
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Catálogo com margem calculada em tempo real
              </h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Cadastre seus bolos, tortas e doces com o preço de venda. O sistema busca automaticamente o custo da receita vinculada e exibe a margem de lucro de cada item — sem planilha, sem conta manual.
              </p>
              <StaggerContainer className="space-y-4">
                {[
                  { color: 'bg-pink-100', iconColor: 'text-pink-600', strong: 'Preço vs. custo lado a lado', text: '— veja de relance se o produto está sendo vendido com margem saudável' },
                  { color: 'bg-pink-100', iconColor: 'text-pink-600', strong: 'Atualização em cascata', text: '— mude o preço da manteiga e a margem do bolo de cenoura atualiza na hora' },
                  { color: 'bg-pink-100', iconColor: 'text-pink-600', strong: 'Integrado a pedidos', text: '— adicione qualquer produto ao pedido do cliente em um clique, sem redigitar preços' },
                ].map((item) => (
                  <motion.li key={item.strong} className="flex items-start gap-3 list-none" variants={staggerItem}>
                    <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full ${item.color} flex items-center justify-center`}>
                      <Check className={`h-3 w-3 ${item.iconColor}`} />
                    </div>
                    <span className="text-sm text-slate-600 leading-relaxed">
                      <strong className="text-slate-700">{item.strong}</strong> {item.text}
                    </span>
                  </motion.li>
                ))}
              </StaggerContainer>
            </FadeIn>
            <FadeIn direction="right" className="order-1 lg:order-2">
              <ParallaxImage src="/produtos_conf.png" alt="Tela de produtos do Confeitando" speed={0.1} />
            </FadeIn>
          </div>

          {/* Integration flow */}
          <FadeUp>
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-pink-50/40 border border-slate-100 p-8 mb-16">
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
                Como os módulos se conectam
              </p>
              <FlowItems />
              <p className="text-center text-sm text-slate-500 mt-6 max-w-xl mx-auto">
                Cada módulo alimenta o próximo. Você não precisa atualizar nada em dois lugares — tudo flui automaticamente.
              </p>
            </div>
          </FadeUp>

          {/* Other modules */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                color: 'bg-orange-100', iconColor: 'text-orange-600', labelColor: 'text-orange-500',
                checkColor: 'text-orange-400', Icon: ShoppingCart, label: 'Pedidos',
                title: 'Do recebimento à entrega',
                body: 'Registre pedidos com cliente, produtos, data de entrega e valor. Acompanhe cada pedido em um pipeline visual: <strong class="text-slate-600">Pendente → Em produção → Pronto → Entregue</strong>. Nada fica perdido no WhatsApp ou no caderno.',
                items: ['Histórico completo de pedidos com filtro por status e data', 'Valor total calculado automaticamente pelos produtos selecionados', 'Pedido marcado como pago registra a entrada no financeiro'],
              },
              {
                color: 'bg-yellow-100', iconColor: 'text-yellow-600', labelColor: 'text-yellow-600',
                checkColor: 'text-yellow-500', Icon: Package, label: 'Estoque',
                title: 'Alerta antes de faltar',
                body: 'Cadastre a quantidade atual de cada ingrediente e defina um estoque mínimo. O sistema alerta quando o nível cai abaixo do limite — antes de você descobrir na véspera da entrega que não tem manteiga suficiente.',
                items: ['Estoque mínimo personalizável por ingrediente', 'Painel com todos os ingredientes em estado de alerta', 'Integrado a receitas — saiba exatamente o que falta para produzir'],
              },
              {
                color: 'bg-green-100', iconColor: 'text-green-600', labelColor: 'text-green-600',
                checkColor: 'text-green-500', Icon: DollarSign, label: 'Financeiro',
                title: 'Caixa em tempo real, sem planilha',
                body: 'Registre entradas, saídas e despesas por categoria. Veja o saldo atual e o fluxo mensal em gráfico — e entenda para onde está indo o dinheiro. Vendas de pedidos entram automaticamente, sem lançamento manual.',
                items: ['Lançamentos por categoria: insumos, embalagens, marketing e mais', 'Saldo atual e evolução mensal em gráfico', 'Integrado a pedidos — vendas entram no caixa automaticamente'],
              },
              {
                color: 'bg-indigo-100', iconColor: 'text-indigo-600', labelColor: 'text-indigo-500',
                checkColor: 'text-indigo-400', Icon: BarChart3, label: 'Dashboard & Clientes',
                title: 'Decisões com dados, não com achismo',
                body: 'Veja faturamento, ticket médio e produtos mais vendidos em uma tela só. No módulo de clientes, identifique quem compra mais, com que frequência e quanto já gastou — e cultive quem realmente impulsiona o seu negócio.',
                items: ['KPIs do mês e comparativo com o período anterior', 'Ranking de produtos mais vendidos e mais rentáveis', 'Histórico de cada cliente: total gasto, pedidos e frequência de compra'],
              },
            ].map((mod) => (
              <motion.div key={mod.label} variants={staggerItem}>
                <TiltCard className="rounded-2xl border border-slate-100 bg-slate-50 p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${mod.color} flex-shrink-0`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <mod.Icon className={`h-5 w-5 ${mod.iconColor}`} />
                    </motion.div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-widest ${mod.labelColor} mb-0.5`}>{mod.label}</p>
                      <h3 className="font-semibold text-slate-800">{mod.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: mod.body }} />
                  <ul className="space-y-2 text-sm text-slate-500">
                    {mod.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className={`h-4 w-4 ${mod.checkColor} mt-0.5 flex-shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </TiltCard>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 relative overflow-hidden">
        <ScrollBgLayer className="bg-slate-50" speed={0.1} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simples de começar</h2>
            <p className="mt-4 text-slate-500 text-lg">Três passos e sua confeitaria já está organizada.</p>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { number: '1', icon: Cake, title: 'Crie sua conta', description: 'Cadastro em menos de 2 minutos. Sem burocracia, sem cartão exigido na hora.', color: 'from-pink-400 to-rose-400' },
              { number: '2', icon: FlaskConical, title: 'Configure sua confeitaria', description: 'Adicione produtos, ingredientes e receitas. O sistema calcula os custos automaticamente.', color: 'from-pink-500 to-rose-400' },
              { number: '3', icon: BarChart3, title: 'Gerencie com tranquilidade', description: 'Receba pedidos, acompanhe o financeiro e nunca mais perca o controle do seu negócio.', color: 'from-rose-400 to-pink-500' },
            ].map((step, index, arr) => (
              <motion.div key={step.number} variants={staggerItem} className="relative">
                {index < arr.length - 1 && <StepConnector />}
                <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden h-full">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${step.color}`} />
                  <div className="p-7 text-center">
                    <div className="relative inline-block mb-5">
                      <motion.div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mx-auto`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <step.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white text-[10px] font-bold">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </StaggerContainer>
          <FadeUp delay={0.3} className="text-center mt-10">
            <MagneticButton className="inline-block">
              <Button size="lg" asChild className="bg-pink-500 hover:bg-pink-600 px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-pink-200">
                <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'como_funciona', action: 'signup' }}>
                  Começar agora
                  <ArrowRight className="h-5 w-5" />
                </TrackedLink>
              </Button>
            </MagneticButton>
          </FadeUp>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Quem já usa, não volta atrás</h2>
            <p className="mt-3 text-slate-500 text-lg">Confeiteiras reais que organizaram o negócio com o Confeitando.</p>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                quote: 'Antes eu não sabia se estava tendo lucro ou prejuízo. Agora vejo o custo de cada receita em segundos — isso mudou a minha precificação completamente.',
                name: 'Ana Paula M.',
                role: 'Confeitaria própria · São Paulo',
                rating: 5,
                initial: 'A',
                color: 'bg-pink-100 text-pink-600',
              },
              {
                quote: 'Perdi uma entrega porque esqueci um pedido no WhatsApp. Depois que comecei a usar o Confeitando, isso nunca mais aconteceu. O pipeline de pedidos é incrível.',
                name: 'Fernanda L.',
                role: 'Doces artesanais · Belo Horizonte',
                rating: 5,
                initial: 'F',
                color: 'bg-rose-100 text-rose-600',
              },
              {
                quote: 'Em menos de 2 minutos eu já estava cadastrando meus produtos. Não precisei de tutorial, é muito intuitivo. E o suporte responde rapidíssimo.',
                name: 'Camila R.',
                role: 'Bolos personalizados · Curitiba',
                rating: 5,
                initial: 'C',
                color: 'bg-rose-100 text-rose-600',
              },
            ].map((t) => (
              <motion.div key={t.name} variants={staggerItem}>
                <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-sm p-7 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${t.color}`}>
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 relative overflow-hidden">
        <ScrollBgLayer className="bg-slate-50" speed={0.08} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Planos para cada fase da sua confeitaria</h2>
            <p className="mt-4 text-slate-500 text-lg">Sem contrato. Cancele quando quiser.</p>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 gap-8 sm:grid-cols-3 items-center">
            {plans.map((plan) => (
              <motion.div key={plan.name} variants={staggerItem}>
                <motion.div
                  className={`relative rounded-xl overflow-hidden ${plan.highlight ? 'border-pink-500 border-2 shadow-xl scale-105' : 'border border-slate-200 shadow-sm'} bg-white`}
                  whileHover={{
                    y: -6,
                    boxShadow: plan.highlight
                      ? '0 24px 60px -12px rgba(236,72,153,0.3)'
                      : '0 20px 40px -12px rgba(0,0,0,0.12)',
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  {plan.highlight && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-transparent to-transparent pointer-events-none"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <motion.span
                        className="bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Mais popular
                      </motion.span>
                    </div>
                  )}
                  <div className="p-6 text-center pb-4">
                    <h3 className="font-bold text-slate-800 text-lg">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 ml-1 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                  </div>
                  <div className="px-6 pb-6 space-y-4">
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
                      className={`w-full mt-4 ${plan.highlight ? 'bg-pink-500 hover:bg-pink-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      <TrackedLink
                        href={plan.href}
                        trackEvent="plan_click"
                        trackParams={{ plano: plan.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), location: 'landing' }}
                      >
                        {plan.cta}
                      </TrackedLink>
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Perguntas frequentes</h2>
          </FadeUp>
          <StaggerContainer className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <motion.div key={faq.question} variants={staggerItem}>
                <FaqItem question={faq.question} answer={faq.answer} />
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-b from-pink-50/70 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-100/60 via-transparent to-transparent" />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-pink-200/20 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700 mb-6">
              <Cake className="h-4 w-4" />
              Comece hoje mesmo
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">
              Chega de pedido perdido.<br />
              <span className="text-pink-500">Assine e organize tudo agora.</span>
            </h2>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
              Controle pedidos, custos e estoque em um único lugar. Configure em menos de 2 minutos.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <MagneticButton>
                <Button size="lg" asChild className="bg-pink-500 hover:bg-pink-600 px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-pink-200">
                  <TrackedLink href="/signup" trackEvent="cta_click" trackParams={{ location: 'final_cta', action: 'signup' }}>
                    Assinar agora
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </TrackedLink>
                </Button>
              </MagneticButton>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
              {trustBadges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  className="flex items-center gap-1.5 text-sm text-slate-500"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <badge.icon className="h-4 w-4 text-pink-400" />
                  {badge.label}
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 border-t border-slate-100 bg-white">
        <FadeUp>
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Dúvidas, ajuda ou feedback?</h2>
            <p className="mt-3 text-slate-500">Estamos no WhatsApp e respondemos em até 15 minutos.</p>
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-green-500 px-6 py-3 text-white font-semibold shadow-sm"
              whileHover={{ scale: 1.05, backgroundColor: '#16a34a', boxShadow: '0 8px 24px -6px rgba(34,197,94,0.4)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Falar com suporte
            </motion.a>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <motion.div
              className="flex items-center gap-2 font-bold text-slate-700"
              whileHover={{ scale: 1.03 }}
            >
              <Cake className="h-5 w-5 text-pink-500" />
              <span>Confeitando</span>
            </motion.div>
            <nav className="flex items-center gap-6 text-sm text-slate-500">
              {['#funcionalidades', '#planos', '#faq'].map((href, i) => (
                <a key={href} href={href} className="hover:text-slate-800 transition-colors relative group">
                  {['Funcionalidades', 'Planos', 'FAQ'][i]}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-slate-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
              <Link href="/login" className="hover:text-slate-800 transition-colors">Entrar</Link>
              <Link href="/privacidade" className="hover:text-slate-800 transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-slate-800 transition-colors">Termos</Link>
            </nav>
            <p className="text-sm text-slate-400">© 2026 Confeitando. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Helper sub-components ───────────────────────────────────────────────────

// Decorative parallax background layer — place as absolute child inside a relative+overflow-hidden section
function ScrollBgLayer({ className, speed = 0.15 }: { className?: string; speed?: number }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`])
  return <motion.div ref={ref} className={`absolute inset-0 pointer-events-none ${className ?? ''}`} style={{ y }} />
}

function ParallaxImage({ src, alt, speed = 0.1 }: { src: string; alt: string; speed?: number }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scrollY = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`])

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl"
      style={{ isolation: 'isolate' }}
      whileHover={{
        y: -10,
        boxShadow: '0 32px 72px -16px rgba(236,72,153,0.2), 0 12px 28px -8px rgba(0,0,0,0.1)',
      }}
      transition={{ type: 'spring', stiffness: 160, damping: 26 }}
    >
      <motion.div style={{ y: scrollY }} className="will-change-transform">
        <Image src={src} alt={alt} width={800} height={500} className="w-full h-auto block" />
      </motion.div>
    </motion.div>
  )
}

function StepConnector() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <div ref={ref} className="hidden sm:block absolute top-6 left-[60%] w-[80%] h-px bg-pink-100 overflow-hidden">
      <motion.div
        className="h-full bg-pink-300"
        initial={{ width: '0%' }}
        animate={inView ? { width: '100%' } : {}}
        transition={{ duration: 1.8, delay: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

function FlowItems() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <div ref={ref} className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
      {flowItems.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.1, delay: i * 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${item.color}`}>
              {item.label}
            </span>
            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
          </motion.div>
          {i < flowItems.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.22 + 0.16 }}
            >
              <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0 hidden sm:block" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="py-5 cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium text-slate-800">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            className="text-sm text-slate-500 leading-relaxed overflow-hidden"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
