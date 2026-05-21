import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gold' | 'sage'
}

export function Card({ className, variant = 'glass', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[20px] p-[18px]',
        variant === 'glass' && 'glass',
        variant === 'solid' && 'bg-surface3',
        variant === 'gold'  && 'glass-gold',
        variant === 'sage'  && 'glass-sage text-white',
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
    <div
      className={cn('rounded-2xl bg-surface2/50 p-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}
