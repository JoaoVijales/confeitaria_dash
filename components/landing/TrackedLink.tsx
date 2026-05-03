'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'
import { ComponentProps } from 'react'

type Props = ComponentProps<typeof Link> & {
  trackEvent: string
  trackParams?: Record<string, string>
}

export function TrackedLink({ trackEvent, trackParams, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(trackEvent, trackParams)
        onClick?.(e)
      }}
    />
  )
}
