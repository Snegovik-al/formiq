import { cn } from '@/lib/utils'

type BadgeVariant = 'accent' | 'gold' | 'success' | 'warning' | 'danger' | 'muted' | 'glass'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-accent/10 text-accent border border-accent/20':  variant === 'accent',
          'bg-gold/12 text-gold border border-gold/25':        variant === 'gold',
          'bg-success/10 text-success border border-success/20': variant === 'success',
          'bg-warning/10 text-warning border border-warning/20': variant === 'warning',
          'bg-danger/10 text-danger border border-danger/20':  variant === 'danger',
          'bg-surface2 text-muted border border-border':       variant === 'muted',
          'glass text-text':                                   variant === 'glass',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
