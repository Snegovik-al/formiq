'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'sage' | 'outline' | 'ghost' | 'glass' | 'gold' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all active:scale-95',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-dark text-bg shadow-dark':
              variant === 'primary',
            'bg-accent text-white shadow-accent':
              variant === 'sage',
            'bg-transparent border border-border text-text':
              variant === 'outline',
            'bg-transparent text-text':
              variant === 'ghost',
            'glass text-text':
              variant === 'glass',
            'bg-danger/10 text-danger border border-danger/25':
              variant === 'danger',
          },
          variant === 'gold' && 'text-white',
          {
            'px-3 py-2 text-sm':      size === 'sm',
            'px-4 py-3.5 text-[15px]': size === 'md',
            'px-5 py-4 text-[15px]':   size === 'lg',
          },
          fullWidth && 'w-full',
          className
        )}
        style={variant === 'gold' ? {
          background: 'linear-gradient(135deg, #c9a84c, #8B6914)',
        } : undefined}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
