'use client'

import { useEffect } from 'react'

// Captura erros no root layout (app/layout.tsx). Deve incluir <html> e <body>.
export default function RootError({
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
        message: 'Erro crítico no root layout',
        error: {
          name: error.name,
          message: error.message,
          digest: error.digest,
        },
        context: { service: 'other', location: 'global-error-boundary' },
      }),
    )
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-white text-slate-900">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <p className="text-lg font-semibold">Algo deu errado.</p>
          <p className="text-sm text-slate-500">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : 'Recarregue a página ou tente novamente em alguns instantes.'}
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 font-mono">Código: {error.digest}</p>
          )}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '8px 16px', borderRadius: 6, background: '#0f172a', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Recarregar página
            </button>
            <button
              onClick={reset}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', color: '#334155', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
