'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props { onNext: () => void }

export default function StepBody({ onNext }: Props) {
  const { data, setField } = useOnboardingStore()
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h2 className="font-display font-bold text-3xl text-text mb-1">Твои параметры</h2>
        <p className="text-muted">AI использует их для расчёта нагрузки</p>
      </div>

      {/* Units toggle */}
      <div className="flex gap-2">
        {(['metric', 'imperial'] as const).map(u => (
          <button
            key={u}
            onClick={() => setUnits(u)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              units === u ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
            )}
          >
            {u === 'metric' ? 'кг / см' : 'lbs / ft'}
          </button>
        ))}
      </div>

      {/* Height */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">
          Рост ({units === 'metric' ? 'см' : 'ft'})
        </label>
        <div className="flex items-center justify-between bg-surface2 rounded-xl px-2 py-2">
          <button
            onClick={() => setField('height_cm', Math.max(140, data.height_cm - 1))}
            className="w-12 h-12 rounded-xl bg-surface3 text-text text-xl font-bold active:scale-90 transition-transform"
          >−</button>
          <span className="font-mono text-3xl font-bold text-text">{data.height_cm}</span>
          <button
            onClick={() => setField('height_cm', Math.min(230, data.height_cm + 1))}
            className="w-12 h-12 rounded-xl bg-surface3 text-text text-xl font-bold active:scale-90 transition-transform"
          >+</button>
        </div>
      </div>

      {/* Weight */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">
          Вес ({units === 'metric' ? 'кг' : 'lbs'})
        </label>
        <div className="flex items-center justify-between bg-surface2 rounded-xl px-2 py-2">
          <button
            onClick={() => setField('weight_kg', Math.max(30, data.weight_kg - 0.5))}
            className="w-12 h-12 rounded-xl bg-surface3 text-text text-xl font-bold active:scale-90 transition-transform"
          >−</button>
          <span className="font-mono text-3xl font-bold text-text">{data.weight_kg}</span>
          <button
            onClick={() => setField('weight_kg', Math.min(250, data.weight_kg + 0.5))}
            className="w-12 h-12 rounded-xl bg-surface3 text-text text-xl font-bold active:scale-90 transition-transform"
          >+</button>
        </div>
      </div>

      <p className="text-xs text-muted text-center">
        Данные используются только для подбора нагрузки, не для оценки
      </p>

      <Button fullWidth size="lg" onClick={onNext} className="mt-auto">
        Далее
      </Button>
    </div>
  )
}
