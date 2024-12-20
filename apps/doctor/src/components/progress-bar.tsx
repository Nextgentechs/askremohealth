import NProgress from 'nprogress'
import { useEffect } from 'react'

import { useRouterState } from '@tanstack/react-router'
import '@/styles/progress-bar.css'

export function ProgressBar() {
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  useEffect(() => {
    if (isLoading) {
      NProgress.start()
    } else {
      NProgress.done()
    }
  }, [isLoading])

  return null
}
