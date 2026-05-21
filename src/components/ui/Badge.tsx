import { cn } from '@/lib/utils'

type BadgeVariant = 'accent' | 'success' | 'warning' | 'danger' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-accent/15 text-accent':   variant === 'accent',
          'bg-success/15 text-success': variant === 'success',
          'bg-warning/15 text-warning': variant === 'warning',
          'bg-danger/15 text-danger':   variant === 'danger',
          'bg-surface3 text-muted':     variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
