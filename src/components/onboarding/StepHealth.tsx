'use client'

import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface Props { onNext: () => void }

const RESTRICTIONS = [
  { id: 'lower_back',    label: 'Боль в спине / пояснице' },
  { id: 'knee',          label: 'Проблемы с коленями' },
  { id: 'shoulder',      label: 'Травма плеча' },
  { id: 'neck',          label: 'Боль в шее' },
  { id: 'wrist',         label: 'Проблемы с запястьями' },
  { id: 'hypertension',  label: 'Гипертония' },
  { id: 'heart',         label: 'Проблемы с сердцем' },
  { id: 'pregnancy',     label: 'Беременность / послеродовой' },
]

export default function StepHealth({ onNext }: Props) {
  const { data, setField } = useOnboardingStore()

  const selected = data.injury_areas

  function toggle(id: string) {
    const current = [...selected]
    const idx = current.indexOf(id)
    if (idx === -1) {
      setField('injury_areas', [...current, id])
    } else {
      current.splice(idx, 1)
      setField('injury_areas', current)
    }
  }

  function clearAll() {
    setField('injury_areas', [])
  }

  return (
    <div className="flex flex-col gap-5 pt-4">
      <div>
        <h2 className="font-display font-bold text-3xl text-text mb-1">Ограничения здоровья</h2>
        <p className="text-muted">AI исключит опасные упражнения</p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20">
        <AlertTriangle size={16} className="text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-warning/90 leading-relaxed">
          FORMIQ — тренировочный инструмент, не медицинская рекомендация. При серьёзных заболеваниях проконсультируйтесь с врачом.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {RESTRICTIONS.map(r => {
          const isSelected = selected.includes(r.id)
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-98 text-left',
                isSelected
                  ? 'border-warning/60 bg-warning/10'
                  : 'border-transparent bg-surface2'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                isSelected ? 'bg-warning border-warning' : 'border-surface3'
              )}>
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={cn('text-sm font-medium', isSelected ? 'text-warning' : 'text-text/80')}>
                {r.label}
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={clearAll}
        className="py-3 rounded-xl bg-success/10 border border-success/20 text-success font-medium text-sm active:scale-95 transition-transform"
      >
        ✓ Всё в порядке, ограничений нет
      </button>

      <Button fullWidth size="lg" onClick={onNext} className="mt-auto">
        Далее
      </Button>
    </div>
  )
}
