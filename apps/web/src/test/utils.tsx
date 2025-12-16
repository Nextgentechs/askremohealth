/**
 * Test Utilities
 *
 * Custom render function and utilities for testing React components
 * with all necessary providers pre-configured.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactElement, type ReactNode } from 'react'

/**
 * Create a fresh QueryClient for each test to prevent cache pollution
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries in tests for faster failures
        retry: false,
        // Disable garbage collection time
        gcTime: 0,
        // Disable stale time
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * All Providers wrapper for testing
 * Add more providers here as needed (theme, auth context, etc.)
 */
interface AllProvidersProps {
  children: ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

/**
 * Custom render function that wraps components with all providers
 *
 * @example
 * ```tsx
 * const { user } = renderWithProviders(<MyComponent />)
 * await user.click(screen.getByRole('button'))
 * ```
 */
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent }

// Override default render with our custom render
export { renderWithProviders as render }
