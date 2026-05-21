'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'gold' | 'danger'
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
          'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-95',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-accent text-white shadow-accent hover:bg-accent/90':
              variant === 'primary',
            'glass text-text hover:bg-white/70':
              variant === 'glass',
            'bg-surface2 text-text border border-border hover:bg-surface3':
              variant === 'secondary',
            'bg-transparent text-text hover:bg-surface2':
              variant === 'ghost',
            'bg-gold text-white shadow-gold hover:bg-gold/90':
              variant === 'gold',
            'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20':
              variant === 'danger',
          },
          {
            'px-3 py-2 text-sm':      size === 'sm',
            'px-4 py-3.5 text-base':  size === 'md',
            'px-5 py-4 text-base':    size === 'lg',
          },
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
