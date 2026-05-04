import type { Metadata } from 'next'
import Link from 'next/link'
import { Cake } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso do Confeitando — condições para utilização do software de gestão para confeitarias.',
  alternates: { canonical: '/termos' },
  robots: { index: true, follow: true },
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-800 text-lg">
            <Cake className="h-6 w-6 text-pink-500" />
            <span>Confeitando</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Termos de Uso</h1>
        <p className="text-slate-500 text-sm mb-10">Última atualização: maio de 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta e utilizar o <strong>Confeitando</strong>, você declara que leu, entendeu e concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. O serviço</h2>
            <p>
              O Confeitando é um software de gestão para confeiteiros artesanais, oferecido como serviço (SaaS) via navegador web. Disponibilizamos módulos de pedidos, receitas, estoque, clientes e financeiro. O serviço é fornecido "como está" e pode ser atualizado, expandido ou descontinuado a qualquer momento, com aviso prévio razoável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Cadastro e conta</h2>
            <p>Para usar o Confeitando você precisa:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Ser maior de 18 anos ou ter autorização de responsável legal.</li>
              <li>Fornecer informações verdadeiras e mantê-las atualizadas.</li>
              <li>Manter a confidencialidade da sua senha.</li>
            </ul>
            <p className="mt-3">
              Você é responsável por todas as atividades realizadas com sua conta. Em caso de uso não autorizado, notifique-nos imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Planos e pagamento</h2>
            <p>
              O Confeitando é oferecido mediante assinatura mensal nos planos Básico (R$ 9,90), Pro (R$ 49,90) e Max (R$ 99,90). Os valores podem ser atualizados com aviso prévio de 30 dias por e-mail.
            </p>
            <p className="mt-3">
              O pagamento é cobrado mensalmente no dia da contratação. Não há contrato de fidelidade — você pode cancelar a qualquer momento. O acesso ao serviço se mantém até o fim do período pago.
            </p>
            <p className="mt-3">
              Não realizamos reembolsos por períodos parciais já pagos, exceto nos casos previstos pelo Código de Defesa do Consumidor (CDC).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Uso permitido</h2>
            <p>Você pode usar o Confeitando para gerenciar sua confeitaria artesanal. É proibido:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Usar o serviço para fins ilegais ou fraudulentos.</li>
              <li>Tentar acessar contas de outros usuários ou sistemas internos.</li>
              <li>Fazer engenharia reversa, copiar ou distribuir qualquer parte do software.</li>
              <li>Sobrecarregar deliberadamente a infraestrutura (ataques DoS).</li>
              <li>Revender ou sublicenciar o acesso ao serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Seus dados</h2>
            <p>
              Você é o único proprietário dos dados que cadastra no Confeitando (produtos, pedidos, receitas, clientes, financeiro). Não reivindicamos propriedade sobre esses dados. Para detalhes sobre como tratamos suas informações, consulte nossa{' '}
              <Link href="/privacidade" className="text-pink-500 underline hover:text-pink-600">Política de Privacidade</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Propriedade intelectual</h2>
            <p>
              O código, design, marca, logo e toda a interface do Confeitando são de propriedade exclusiva da equipe Confeitando. Estes Termos não transferem nenhum direito de propriedade intelectual a você.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Disponibilidade e garantias</h2>
            <p>
              Nos esforçamos para manter o Confeitando disponível, mas não garantimos disponibilidade ininterrupta. O serviço pode ficar temporariamente indisponível por manutenção, falhas técnicas ou causas fora do nosso controle.
            </p>
            <p className="mt-3">
              O serviço é fornecido "como está", sem garantias expressas ou implícitas de adequação a um fim específico. Não nos responsabilizamos por decisões de negócio tomadas com base nos dados do sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Limitação de responsabilidade</h2>
            <p>
              Na extensão máxima permitida por lei, a responsabilidade total do Confeitando por qualquer reclamação decorrente do uso do serviço é limitada ao valor pago nos últimos 3 meses de assinatura.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Cancelamento e encerramento</h2>
            <p>
              Você pode cancelar sua conta a qualquer momento pelo painel de configurações. Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, com ou sem aviso prévio dependendo da gravidade da violação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">11. Alterações nos termos</h2>
            <p>
              Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão notificadas por e-mail com pelo menos 15 dias de antecedência. O uso continuado após essa data implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">12. Lei aplicável e foro</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Eventuais conflitos serão resolvidos no foro da comarca de domicílio do usuário, conforme o Código de Defesa do Consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">13. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos, entre em contato:
            </p>
            <p className="mt-2">
              <strong>E-mail:</strong> contato@confeitando.vijales.com
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© 2026 Confeitando. Todos os direitos reservados.</span>
          <nav className="flex gap-4">
            <Link href="/privacidade" className="hover:text-slate-600 transition-colors">Política de Privacidade</Link>
            <Link href="/" className="hover:text-slate-600 transition-colors">Página inicial</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
