'use client'

import { useEffect } from 'react'
import { WhatsAppIcon, WHATSAPP_URL } from '@/components/SupportButton'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Erro não tratado no dashboard',
        error: {
          name: error.name,
          message: error.message,
          digest: error.digest,
        },
        context: { service: 'other', location: 'dashboard/error-boundary' },
      }),
    )
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
      <p className="text-lg font-semibold text-slate-800">Algo deu errado.</p>
      <p className="text-sm text-slate-500">
        Recarregue a página ou tente novamente em alguns instantes.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 font-mono">Código: {error.digest}</p>
      )}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Recarregar página
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
        <p className="text-sm text-slate-500">Se o erro persistir, fale com nosso suporte.</p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Falar com suporte
        </a>
        <p className="text-xs text-slate-400">Respondemos em até 15 minutos</p>
      </div>
    </div>
  )
}
