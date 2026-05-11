import type { Metadata } from 'next'
import { LandingPageContent } from '@/components/landing/LandingPageContent'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const faqs = [
  { question: 'Preciso instalar algum programa?', answer: 'Não. O Confeitando funciona direto no navegador, em qualquer dispositivo — computador, celular ou tablet.' },
  { question: 'Funciona bem no celular?', answer: 'Sim. O dashboard é totalmente responsivo e foi testado em telas pequenas para funcionar bem mesmo na correria do dia a dia.' },
  { question: 'Posso cancelar quando quiser?', answer: 'Sim. Não existe fidelidade nem multa. Você cancela quando quiser, sem complicação.' },
  { question: 'Meus dados ficam seguros?', answer: 'Seus dados são armazenados com criptografia, com backup automático. Nunca compartilhamos suas informações com terceiros.' },
  { question: 'E se minha confeitaria crescer?', answer: 'É só fazer upgrade de plano. Você migra em segundos e não perde nenhum dado cadastrado.' },
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <LandingPageContent />
    </>
  )
}
