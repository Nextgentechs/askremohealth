'use client'

import { cn } from '@web/lib/utils'

/**
 * SkipToMain - Accessibility component for keyboard navigation
 *
 * Provides a skip link that allows keyboard users to bypass
 * navigation and jump directly to the main content.
 * Only visible when focused (via Tab key).
 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className={cn(
        'fixed left-4 top-4 z-[100] -translate-y-full',
        'rounded-md bg-primary px-4 py-2 text-primary-foreground',
        'font-medium shadow-lg transition-transform duration-200',
        'focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      )}
    >
      Skip to main content
    </a>
  )
}
