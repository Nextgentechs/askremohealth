'use client'

import { useState, useEffect } from 'react'

export default function SuppressHydrationWarnings({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only mark as mounted on the client
    setMounted(true)
  }, [])

  // Render nothing during SSR to avoid mismatches
  if (!mounted) return null

  // Render children normally once mounted
  return <>{children}</>
}
