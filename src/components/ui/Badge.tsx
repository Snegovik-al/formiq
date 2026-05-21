import { cn } from '@/lib/utils'

type BadgeVariant = 'accent' | 'gold' | 'success' | 'warning' | 'danger' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide',
        {
          'bg-accent/13 text-accent border border-accent/20':   variant === 'accent' || variant === 'success',
          'bg-gold/15 text-[#8B6914] border border-gold/25':    variant === 'gold' || variant === 'warning',
          'bg-danger/10 text-danger border border-danger/20':   variant === 'danger',
          'bg-surface3/60 text-muted border border-border/60':  variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
