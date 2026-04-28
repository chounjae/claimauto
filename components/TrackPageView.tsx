'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export default function TrackPageView({ event, properties }: {
  event: string
  properties?: Record<string, unknown>
}) {
  useEffect(() => {
    track(event, properties)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
