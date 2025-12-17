/**
 * Button Component Tests
 *
 * Tests for the Button UI component variants and behaviors.
 */

import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../components/ui/button'
import { render, screen } from '../utils'

describe('Button', () => {
  describe('rendering', () => {
    it('should render with default variant', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
    })

    it('should render children correctly', () => {
      render(<Button>Submit Form</Button>)
      expect(screen.getByText('Submit Form')).toBeInTheDocument()
    })

    it('should render as a link when asChild with anchor', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      )
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })
  })

  describe('variants', () => {
    it('should apply default variant classes', () => {
      render(<Button>Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('should apply destructive variant classes', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('should apply link variant classes', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('underline-offset-4')
    })
  })

  describe('sizes', () => {
    it('should apply default size classes', () => {
      render(<Button>Default Size</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
    })

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8')
    })

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
    })

    it('should apply icon size classes', () => {
      render(<Button size="icon">🔍</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-9')
    })
  })

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should have disabled styling', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })

  describe('interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn()
      const { user } = render(<Button onClick={handleClick}>Click</Button>)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const { user } = render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      )

      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have accessible name from children', () => {
      render(<Button>Accessible Button</Button>)
      expect(
        screen.getByRole('button', { name: 'Accessible Button' }),
      ).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      expect(
        screen.getByRole('button', { name: 'Close dialog' }),
      ).toBeInTheDocument()
    })

    it('should be focusable', () => {
      render(<Button>Focusable</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('custom className', () => {
    it('should merge custom className with variant classes', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('bg-primary') // Still has variant class
    })
  })
})
