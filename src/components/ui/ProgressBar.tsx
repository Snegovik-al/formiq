'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  accentColor?: boolean
}

export function ProgressBar({ value, max = 100, className, accentColor = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('h-1.5 w-full rounded-full bg-surface3 overflow-hidden', className)}>
      <motion.div
        className={cn('h-full rounded-full', accentColor ? 'bg-accent' : 'bg-blue')}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}

interface StepDotsProps {
  total: number
  current: number
}

export function StepDots({ total, current }: StepDotsProps) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i < current ? 'w-6 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-surface3'
          )}
        />
      ))}
    </div>
  )
}
