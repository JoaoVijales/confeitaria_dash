'use client'

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'
import { useState } from 'react'
import { logError } from '@/lib/logger'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            logError('Erro em query', error, {
              service: 'other',
              operation: `query:${String(query.queryKey[0])}`,
            })
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            logError('Erro em mutation', error, {
              service: 'other',
              operation: `mutation:${String(mutation.options.mutationKey?.[0] ?? 'unknown')}`,
            })
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
