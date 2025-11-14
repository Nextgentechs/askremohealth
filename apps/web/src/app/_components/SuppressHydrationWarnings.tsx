'use client'

import { useEffect } from 'react'

export default function SuppressHydrationWarnings({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalError = console.error

    console.error = (...args) => {
      const msg = args[0]
      if (typeof msg === 'string' && msg.includes('Hydration failed')) {
        return
      }
      if (typeof msg === 'string' && msg.includes('Text content does not match server-rendered HTML')) {
        return
      }
      originalError(...args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return <>{children}</>
}
