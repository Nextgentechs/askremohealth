'use client'

import { useState, useEffect } from 'react'

export default function SuppressHydrationWarnings({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Delay just enough so React can safely re-render
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div suppressHydrationWarning>
      {ready ? children : null}
    </div>
  )
}
