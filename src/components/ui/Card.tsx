import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  variant?: 'default' | 'glass' | 'gold' | 'solid'
}

export function Card({ className, glow, variant = 'glass', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        {
          'glass': variant === 'glass',
          'bg-surface border border-border shadow-glass': variant === 'default',
          'glass-gold': variant === 'gold',
          'bg-accent text-white': variant === 'solid',
        },
        glow && 'shadow-[0_0_0_1px_rgba(196,147,63,0.3),0_8px_32px_rgba(196,147,63,0.12)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardSection({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl bg-surface2/60 p-3', className)} {...props}>
      {children}
    </div>
  )
}
