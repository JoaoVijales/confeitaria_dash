import { sendGAEvent } from '@next/third-parties/google'

type TrackableSection =
  | 'visao_geral'
  | 'pedidos'
  | 'produtos'
  | 'ingredientes'
  | 'receitas'
  | 'clientes'
  | 'financeiro'
  | 'entradas'
  | 'saidas'
  | 'billing'

export function track(event: string, params?: Record<string, string>): void {
  sendGAEvent('event', event, params ?? {})
}

export function trackSection(secao: TrackableSection): void {
  track('section_viewed', { secao })
}

export type { TrackableSection }
