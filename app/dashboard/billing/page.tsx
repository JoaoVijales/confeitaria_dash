'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Check, CreditCard, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePlan } from '@/hooks/usePlan'
import { createCheckoutSession, cancelSubscription } from '@/app/actions/billing'

const plans = [
  {
    key: 'free' as const,
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    limits: ['Até 30 produtos', 'Até 50 pedidos/mês', 'Todos os módulos'],
  },
  {
    key: 'basic' as const,
    name: 'Básico',
    price: 'R$ 49',
    period: '/mês',
    limits: ['Até 200 produtos', 'Pedidos ilimitados', 'Suporte prioritário'],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: 'R$ 99',
    period: '/mês',
    limits: ['Produtos ilimitados', 'Pedidos ilimitados', 'Analytics avançado', 'Suporte dedicado'],
  },
]

// Polling para aguardar confirmação do webhook — para após 2 minutos.
const POLL_TIMEOUT_MS = 2 * 60 * 1000

function BillingPageContent() {
  const params = useSearchParams()
  const isSuccess = params.get('success') === 'true'
  const pollDeadlineRef = useRef(isSuccess ? Date.now() + POLL_TIMEOUT_MS : 0)

  useEffect(() => {
    if (isSuccess) pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS
  }, [isSuccess])

  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const { data: planData, isLoading } = usePlan({
    refetchInterval: (query) => {
      if (!isSuccess) return false
      if (query.state.data && query.state.data.plan !== 'free') return false
      if (Date.now() > pollDeadlineRef.current) return false
      return 3000
    },
  })

  async function handleUpgrade(planKey: string) {
    if (upgradingPlan) return
    setUpgradingPlan(planKey)
    try {
      await createCheckoutSession(planKey)
    } catch {
      toast.error('Erro ao iniciar checkout. Tente novamente.')
      setUpgradingPlan(null)
    }
    // Não limpa o estado em caso de sucesso — o usuário será redirecionado
  }

  async function handleCancel() {
    if (cancelling) return
    setCancelling(true)
    try {
      await cancelSubscription()
      toast.success('Assinatura cancelada. Você voltará ao plano Gratuito.')
    } catch {
      toast.error('Você não possui uma assinatura ativa.')
    } finally {
      setCancelling(false)
    }
  }

  const currentPlan = planData?.plan ?? 'free'

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Plano & Billing</h1>
        <p className="text-slate-600 mt-1">Gerencie sua assinatura e plano atual.</p>
      </div>

      {isSuccess && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm font-medium">
          {currentPlan !== 'free'
            ? 'Assinatura ativada com sucesso! Obrigado por assinar.'
            : 'Pagamento recebido! Ativando sua assinatura…'}
        </div>
      )}

      {/* Current plan summary */}
      <Card className="mb-8 border-pink-200 bg-pink-50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-slate-800">Plano atual</CardTitle>
              <CardDescription>
                {isLoading ? 'Carregando...' : planData?.tenantName}
              </CardDescription>
            </div>
            <Badge className="bg-pink-500 text-white text-sm px-3 py-1">
              {planData?.limits.name ?? 'Gratuito'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-pink-500" />
              <span>
                Limite de produtos:{' '}
                <strong>
                  {planData?.limits.maxProducts === Infinity ? 'Ilimitado' : planData?.limits.maxProducts}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-pink-500" />
              <span>
                Pedidos/mês:{' '}
                <strong>
                  {planData?.limits.maxOrdersPerMonth === Infinity ? 'Ilimitado' : planData?.limits.maxOrdersPerMonth}
                </strong>
              </span>
            </div>
          </div>
          {currentPlan !== 'free' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cancelling ? 'Cancelando...' : 'Cancelar assinatura'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan options */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan
          return (
            <Card
              key={plan.key}
              className={`relative ${isCurrent ? 'border-pink-500 border-2' : 'border-slate-200'}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Plano atual
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-slate-800">{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 ml-1 text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.limits.map((limit) => (
                    <li key={limit} className="flex items-center gap-2 text-slate-700 text-sm">
                      <Check className="h-4 w-4 text-pink-500 flex-shrink-0" />
                      {limit}
                    </li>
                  ))}
                </ul>
                {!isCurrent && plan.key !== 'free' && (
                  <Button
                    onClick={() => handleUpgrade(plan.key)}
                    className="w-full bg-pink-500 hover:bg-pink-600"
                    disabled={!!upgradingPlan}
                  >
                    {upgradingPlan === plan.key && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {upgradingPlan === plan.key ? 'Redirecionando...' : 'Fazer upgrade'}
                  </Button>
                )}
                {isCurrent && (
                  <Button disabled className="w-full" variant="outline">
                    Plano atual
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingPageContent />
    </Suspense>
  )
}
