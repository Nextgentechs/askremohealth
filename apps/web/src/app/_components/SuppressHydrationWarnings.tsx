'use client'

import { useState, useEffect, type ReactNode } from 'react'

type SuppressHydrationWarningsProps = {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Suppresses hydration errors by delaying rendering until client-side.
 * Use this around any component that depends on window, Date, Math.random, or third-party libraries.
 */
export default function SuppressHydrationWarnings({
  children,
  fallback = null,
}: SuppressHydrationWarningsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render fallback on SSR to avoid hydration mismatch
  if (!mounted) return <>{fallback}</>

  // Render actual children on client
  return <>{children}</>
}
