import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface p-4',
        glow && 'ring-1 ring-accent/20 shadow-[0_0_20px_rgba(200,255,0,0.08)]',
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
    <div className={cn('rounded-xl bg-surface2 p-3', className)} {...props}>
      {children}
    </div>
  )
}
