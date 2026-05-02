'use client'

import { useEffect } from 'react'
import { trackSection, type TrackableSection } from '@/lib/analytics'

export function SectionTracker({ secao }: { secao: TrackableSection }) {
  useEffect(() => {
    let cancelled = false
    // setTimeout(0) garante que o evento só dispara se o componente
    // continuar montado — sobrevive ao double-mount do StrictMode.
    const timer = setTimeout(() => {
      if (!cancelled) trackSection(secao)
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [secao])

  return null
}
