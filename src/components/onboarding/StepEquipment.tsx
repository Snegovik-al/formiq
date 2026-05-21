'use client'

import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { WorkoutLocation } from '@/types'

interface Props { onNext: () => void }

const LOCATIONS: { id: WorkoutLocation; emoji: string; label: string }[] = [
  { id: 'gym',     emoji: '🏋️', label: 'В зале' },
  { id: 'home',    emoji: '🏠', label: 'Дома' },
  { id: 'outdoor', emoji: '🌳', label: 'На улице' },
]

const HOME_EQUIPMENT = [
  { id: 'mat',              label: 'Коврик' },
  { id: 'dumbbell_fixed',   label: 'Гантели (фикс.)' },
  { id: 'dumbbell_adj',     label: 'Разборные гантели' },
  { id: 'pullup_bar',       label: 'Турник' },
  { id: 'resistance_band',  label: 'Эспандеры' },
  { id: 'kettlebell',       label: 'Гиря' },
  { id: 'jump_rope',        label: 'Скакалка' },
  { id: 'bench',            label: 'Скамья' },
]

export default function StepEquipment({ onNext }: Props) {
  const { data, setField } = useOnboardingStore()

  function toggleEquipment(id: string) {
    const current = [...data.equipment]
    const idx = current.indexOf(id)
    if (idx === -1) setField('equipment', [...current, id])
    else { current.splice(idx, 1); setField('equipment', current) }
  }

  return (
    <div className="flex flex-col gap-5 pt-4">
      <div>
        <h2 className="font-display font-bold text-3xl text-text mb-1">Где тренируешься?</h2>
        <p className="text-muted">AI подберёт только доступные упражнения</p>
      </div>

      {/* Location */}
      <div className="grid grid-cols-3 gap-2">
        {LOCATIONS.map(l => (
          <button
            key={l.id}
            onClick={() => setField('location', l.id)}
            className={cn(
              'flex flex-col items-center gap-1 py-4 rounded-xl border-2 transition-all active:scale-95',
              data.location === l.id
                ? 'border-accent bg-accent-dim'
                : 'border-transparent bg-surface2'
            )}
          >
            <span className="text-2xl">{l.emoji}</span>
            <span className={cn('text-sm font-medium', data.location === l.id ? 'text-accent' : 'text-muted')}>
              {l.label}
            </span>
          </button>
        ))}
      </div>

      {/* Equipment (home only) */}
      {data.location === 'home' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text/80">Что есть дома?</label>
          <div className="grid grid-cols-2 gap-2">
            {HOME_EQUIPMENT.map(eq => {
              const isSelected = data.equipment.includes(eq.id)
              return (
                <button
                  key={eq.id}
                  onClick={() => toggleEquipment(eq.id)}
                  className={cn(
                    'py-3 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 text-left',
                    isSelected ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
                  )}
                >
                  {eq.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {data.location === 'gym' && (
        <p className="text-sm text-muted bg-surface2 rounded-xl px-4 py-3">
          ✅ В зале доступно всё оборудование — AI максимально использует это
        </p>
      )}

      {data.location === 'outdoor' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text/80">Что есть на улице?</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: 'pullup_bar', label: 'Турник' }, { id: 'parallel_bars', label: 'Брусья' }, { id: 'jump_rope', label: 'Скакалка' }].map(eq => {
              const isSelected = data.equipment.includes(eq.id)
              return (
                <button key={eq.id} onClick={() => toggleEquipment(eq.id)}
                  className={cn('py-3 px-3 rounded-xl text-sm font-medium transition-all active:scale-95',
                    isSelected ? 'bg-accent text-bg' : 'bg-surface2 text-muted')}
                >
                  {eq.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Button fullWidth size="lg" onClick={onNext} className="mt-auto">
        Далее
      </Button>
    </div>
  )
}
