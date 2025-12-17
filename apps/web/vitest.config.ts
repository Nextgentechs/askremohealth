import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

/**
 * Vitest Configuration for Ask Remo Health
 *
 * This configuration sets up the testing environment with:
 * - React support via @vitejs/plugin-react
 * - jsdom for DOM simulation
 * - Path aliases matching tsconfig
 * - Coverage reporting with v8
 */
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',

    // Setup files run before each test file
    setupFiles: ['./src/test/setup.tsx'],

    // Test file patterns
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', '.next', 'drizzle'],

    // Global test timeout
    testTimeout: 10000,

    // Enable globals like describe, it, expect without imports
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/test/**', 'src/env.js', 'src/types/**'],
      // Thresholds - start low, increase over time
      thresholds: {
        statements: 10,
        branches: 10,
        functions: 10,
        lines: 10,
      },
    },

    // Reporter for test output
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      // Match path aliases from tsconfig.json
      '@web': resolve(__dirname, './src'),
    },
  },
})
