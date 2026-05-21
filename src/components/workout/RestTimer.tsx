'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, SkipForward } from 'lucide-react'

interface RestTimerProps {
  seconds: number
  onDone: () => void
  nextInfo?: string
}

export function RestTimer({ seconds, onDone, nextInfo }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) { onDone(); return }
    const timer = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onDone])

  const progress = (remaining / seconds) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-xl flex flex-col items-center justify-center px-6"
    >
      {/* Circle timer */}
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1E1E1E" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="#C8FF00"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-5xl text-text">{remaining}</span>
          <span className="text-xs text-muted">секунд</span>
        </div>
      </div>

      <p className="font-display font-bold text-2xl text-text mb-2">Отдых</p>
      {nextInfo && (
        <p className="text-sm text-muted text-center mb-8">
          Следующий: {nextInfo}
        </p>
      )}

      <button
        onClick={onDone}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface2 text-text font-medium active:scale-95 transition-transform"
      >
        <SkipForward size={16} />
        Пропустить отдых
      </button>
    </motion.div>
  )
}
