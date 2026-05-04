import type { Metadata } from 'next'
import Link from 'next/link'
import { Cake } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade do Confeitando — como coletamos, usamos e protegemos seus dados conforme a LGPD.',
  alternates: { canonical: '/privacidade' },
  robots: { index: true, follow: true },
}

export default function PrivacidadePage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-slate-500 text-sm mb-10">Última atualização: maio de 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Quem somos</h2>
            <p>
              O <strong>Confeitando</strong> é um software de gestão voltado para confeiteiros artesanais, desenvolvido e operado pela equipe Confeitando. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Dados que coletamos</h2>
            <p>Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Dados de cadastro:</strong> nome, endereço de e-mail e senha (armazenada com hash seguro).</li>
              <li><strong>Dados do negócio:</strong> nome da confeitaria, produtos, ingredientes, receitas, pedidos e informações financeiras que você cadastra.</li>
              <li><strong>Dados de uso:</strong> páginas acessadas e eventos de interação, coletados de forma agregada via Google Analytics para melhorar o produto.</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pelo provedor de pagamento (AbacatePay). Não armazenamos dados de cartão.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Como usamos seus dados</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Criar e manter sua conta e os dados da sua confeitaria.</li>
              <li>Processar pagamentos e gerenciar sua assinatura.</li>
              <li>Enviar comunicações transacionais (confirmação de cadastro, alertas do sistema).</li>
              <li>Melhorar o produto com base em métricas de uso agregadas.</li>
              <li>Cumprir obrigações legais.</li>
            </ul>
            <p className="mt-3">Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Compartilhamento de dados</h2>
            <p>Compartilhamos dados apenas com os prestadores de serviço essenciais à operação da plataforma:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Supabase</strong> — banco de dados e autenticação.</li>
              <li><strong>Firebase</strong> — infraestrutura de backend.</li>
              <li><strong>AbacatePay</strong> — processamento de pagamentos.</li>
              <li><strong>Google Analytics</strong> — análise de uso (dados anonimizados).</li>
            </ul>
            <p className="mt-3">Todos os prestadores acima são contratualmente obrigados a proteger seus dados e a não utilizá-los para fins próprios.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Segurança dos dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados: criptografia em trânsito (TLS) e em repouso, controle de acesso por função e backups automáticos. Nenhum sistema é 100% inviolável, mas fazemos o possível para manter seus dados seguros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Retenção de dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Ao cancelar a assinatura e solicitar exclusão, excluímos seus dados pessoais em até 30 dias, exceto quando a retenção for exigida por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Seus direitos (LGPD)</h2>
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incompletos ou desatualizados.</li>
              <li>Solicitar a exclusão dos seus dados.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Solicitar portabilidade dos dados.</li>
            </ul>
            <p className="mt-3">Para exercer qualquer desses direitos, entre em contato conosco pelo e-mail indicado na seção 9.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Cookies</h2>
            <p>
              Utilizamos cookies estritamente necessários para manter sua sessão autenticada. Também utilizamos cookies do Google Analytics (com anonimização de IP) para entender como o produto é usado. Você pode desativar cookies de análise nas configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contato</h2>
            <p>
              Para dúvidas, solicitações ou exercício dos seus direitos relacionados a esta Política, entre em contato com o nosso encarregado de dados (DPO):
            </p>
            <p className="mt-2">
              <strong>E-mail:</strong> privacidade@confeitando.vijales.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Quando houver mudanças relevantes, notificaremos por e-mail ou por aviso no painel. O uso continuado do serviço após a notificação implica aceitação das novas condições.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© 2026 Confeitando. Todos os direitos reservados.</span>
          <nav className="flex gap-4">
            <Link href="/termos" className="hover:text-slate-600 transition-colors">Termos de Uso</Link>
            <Link href="/" className="hover:text-slate-600 transition-colors">Página inicial</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
