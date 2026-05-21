'use client'

import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { FitnessLevel } from '@/types'

interface Props { onNext: () => void }

const LEVELS: { id: FitnessLevel; label: string; desc: string }[] = [
  { id: 'beginner',     label: 'Новичок',       desc: 'Тренируюсь менее 6 месяцев' },
  { id: 'intermediate', label: 'Средний',        desc: '6 мес — 2 года регулярных тренировок' },
  { id: 'advanced',     label: 'Продвинутый',    desc: '2+ года, знаю технику' },
]

const ACTIVITY: { id: string; label: string }[] = [
  { id: 'none',        label: 'Не тренировался' },
  { id: 'occasional',  label: 'Иногда, нерегулярно' },
  { id: '1-2x',        label: '1–2 раза в неделю' },
  { id: '3x+',         label: '3+ раз в неделю' },
]

export default function StepLevel({ onNext }: Props) {
  const { data, setField } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h2 className="font-display font-bold text-3xl text-text mb-1">Твой уровень</h2>
        <p className="text-muted">AI подберёт подходящую сложность</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Уровень подготовки</label>
        {LEVELS.map(l => (
          <button
            key={l.id}
            onClick={() => setField('fitness_level', l.id)}
            className={cn(
              'flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left active:scale-98',
              data.fitness_level === l.id
                ? 'border-accent bg-accent-dim'
                : 'border-transparent bg-surface2'
            )}
          >
            <div>
              <p className={cn('font-semibold text-sm', data.fitness_level === l.id ? 'text-accent' : 'text-text')}>
                {l.label}
              </p>
              <p className="text-xs text-muted">{l.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Последние 3 месяца</label>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITY.map(a => (
            <button
              key={a.id}
              onClick={() => setField('recent_activity', a.id)}
              className={cn(
                'py-3 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 text-left',
                data.recent_activity === a.id
                  ? 'bg-accent text-bg'
                  : 'bg-surface2 text-muted'
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <Button fullWidth size="lg" onClick={onNext} className="mt-auto">
        Далее
      </Button>
    </div>
  )
}
