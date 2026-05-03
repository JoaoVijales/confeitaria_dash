'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Check, CreditCard, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { usePlan } from '@/hooks/usePlan'
import { createCheckoutSession, cancelSubscription, syncPlanCookie } from '@/app/actions/billing'
import { track } from '@/lib/analytics'
import { SectionTracker } from '@/components/SectionTracker'

const plans = [
  {
    key: 'basic' as const,
    name: 'Básico',
    price: 'R$ 9,90',
    period: '/mês',
    limits: ['Até 10 produtos', 'Pedidos ilimitados', 'Todos os módulos'],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: 'R$ 49,90',
    period: '/mês',
    limits: ['Até 50 produtos', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte prioritário'],
  },
  {
    key: 'max' as const,
    name: 'Max',
    price: 'R$ 99,90',
    period: '/mês',
    limits: ['Produtos ilimitados', 'Pedidos ilimitados', 'Todos os módulos', 'Suporte dedicado'],
  },
]

// Polling para aguardar confirmação do webhook — para após 2 minutos.
const POLL_TIMEOUT_MS = 2 * 60 * 1000

function BillingPageContent() {
  const params = useSearchParams()
  const isSuccess = params.get('success') === 'true'
  const isBlocked = params.get('blocked') === 'true'
  const pollDeadlineRef = useRef(isSuccess ? Date.now() + POLL_TIMEOUT_MS : 0)

  useEffect(() => {
    if (isSuccess) pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS
  }, [isSuccess])

  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const { data: planData, isLoading } = usePlan({
    refetchInterval: (query) => {
      if (!isSuccess) return false
      const data = query.state.data
      // Para quando o plano for pago E o status for ativo
      if (data && data.plan !== 'free' && data.status === 'active') return false
      if (Date.now() > pollDeadlineRef.current) return false
      return 3000
    },
  })

  // Sincroniza o cookie __plan na primeira carga da billing page e quando o plano ativa.
  // Garante que o middleware tenha o estado correto para navegações futuras.
  useEffect(() => {
    syncPlanCookie().catch(() => {})
  }, [])

  const hasActivePlan = planData?.plan !== 'free' && planData?.status === 'active'

  useEffect(() => {
    if (hasActivePlan) syncPlanCookie().catch(() => {})
  }, [hasActivePlan])

  async function handleUpgrade(planKey: string) {
    if (upgradingPlan) return
    setUpgradingPlan(planKey)
    try {
      track('checkout_iniciado', { plano: planKey })
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
    setShowCancelDialog(false)
    try {
      await cancelSubscription(cancelReason || undefined)
      toast.success('Assinatura cancelada. Seu acesso será encerrado em breve.')
      track('assinatura_cancelada')
      setCancelReason('')
    } catch {
      toast.error('Você não possui uma assinatura ativa.')
    } finally {
      setCancelling(false)
    }
  }

  const currentPlan = planData?.plan ?? 'free'

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <SectionTracker secao="billing" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Plano & Billing</h1>
        <p className="text-slate-600 mt-1">Gerencie sua assinatura e plano atual.</p>
      </div>

      {isBlocked && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm font-medium">
          O plano gratuito não está mais disponível. Escolha um plano abaixo para continuar usando o dashboard.
        </div>
      )}

      {isSuccess && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm font-medium">
          {hasActivePlan
            ? 'Assinatura ativada com sucesso! Obrigado por assinar.'
            : 'Pagamento recebido! Ativando sua assinatura…'}
        </div>
      )}

      {/* Current plan summary */}
      {hasActivePlan && (
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
                {planData?.limits.name}
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
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelling}
            >
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cancelling ? 'Cancelando...' : 'Cancelar assinatura'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan options */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan && hasActivePlan
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
                {isCurrent ? (
                  <Button disabled className="w-full" variant="outline">
                    Plano atual
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.key)}
                    className="w-full bg-pink-500 hover:bg-pink-600"
                    disabled={!!upgradingPlan}
                  >
                    {upgradingPlan === plan.key && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {upgradingPlan === plan.key ? 'Redirecionando...' : 'Assinar'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar assinatura?</DialogTitle>
            <DialogDescription>
              Seu acesso será encerrado ao final do período vigente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason" className="text-slate-700">
              Motivo do cancelamento <span className="text-slate-400 font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="Nos conte o que poderia ser melhorado..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-6 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-8">
          {[0, 1, 2].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  )
}
