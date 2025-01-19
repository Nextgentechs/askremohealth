import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'src/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        scheduled:
          'bg-scheduled-background text-scheduled-foreground border-transparent hover:bg-scheduled-background/80',
        pending:
          'bg-pending-background text-pending-foreground border-transparent hover:bg-pending-background/80',
        rescheduled:
          'bg-rescheduled-background text-rescheduled-foreground border-transparent hover:bg-rescheduled-background/80',
        completed:
          'bg-completed-background text-completed-foreground border-transparent hover:bg-completed-background/80  ',
        cancelled:
          'bg-cancelled-background text-cancelled-foreground border-transparent hover:bg-cancelled-background/80',
        missed:
          'bg-no-show-background text-no-show-foreground border-transparent hover:bg-no-show-background/80',
        in_progress:
          'bg-progress-background text-progress-foreground border-transparent hover:bg-progress-background/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
