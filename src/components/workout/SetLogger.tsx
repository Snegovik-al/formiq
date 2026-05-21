'use client'

import { useState } from 'react'
import { ExerciseBlock } from '@/types'
import { cn } from '@/lib/utils'
import { Check, Plus, Minus } from 'lucide-react'

interface SetLoggerProps {
  exercise: ExerciseBlock
  currentSet: number
  onSetComplete: (weight: number, reps: number) => void
}

export function SetLogger({ exercise, currentSet, onSetComplete }: SetLoggerProps) {
  const defaultReps = parseInt(exercise.reps?.split('-')[0] ?? '10') || 10
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(defaultReps)

  function adj(field: 'weight' | 'reps', delta: number) {
    if (field === 'weight') setWeight(w => Math.max(0, Math.round((w + delta) * 2) / 2))
    else setReps(r => Math.max(1, r + delta))
  }

  return (
    <div className="bg-surface rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-text/80">Сет {currentSet} из {exercise.sets}</p>
        <div className="flex gap-1">
          {Array.from({ length: exercise.sets }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full',
                i < currentSet - 1 ? 'bg-accent' : i === currentSet - 1 ? 'bg-accent/60' : 'bg-surface3'
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Weight */}
        <div>
          <p className="text-xs text-muted text-center mb-2">Вес (кг)</p>
          <div className="flex items-center justify-between bg-surface2 rounded-xl px-2 py-2">
            <button
              onClick={() => adj('weight', -2.5)}
              className="w-9 h-9 flex items-center justify-center text-muted active:scale-90 transition-transform"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono font-bold text-xl text-text">{weight}</span>
            <button
              onClick={() => adj('weight', 2.5)}
              className="w-9 h-9 flex items-center justify-center text-muted active:scale-90 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Reps */}
        <div>
          <p className="text-xs text-muted text-center mb-2">Повторения</p>
          <div className="flex items-center justify-between bg-surface2 rounded-xl px-2 py-2">
            <button
              onClick={() => adj('reps', -1)}
              className="w-9 h-9 flex items-center justify-center text-muted active:scale-90 transition-transform"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono font-bold text-xl text-text">{reps}</span>
            <button
              onClick={() => adj('reps', 1)}
              className="w-9 h-9 flex items-center justify-center text-muted active:scale-90 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSetComplete(weight, reps)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-bg font-bold active:scale-95 transition-transform"
      >
        <Check size={18} />
        Завершить сет
      </button>
    </div>
  )
}
