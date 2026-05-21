'use client'

import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props { onNext: () => void }

const DAYS_OPTIONS = [2, 3, 4, 5, 6]
const DURATION_OPTIONS = [
  { val: 20,  label: '20 мин' },
  { val: 30,  label: '30 мин' },
  { val: 45,  label: '45 мин' },
  { val: 60,  label: '60 мин' },
]
const TIME_OPTIONS = [
  { id: 'morning',   emoji: '🌅', label: 'Утром' },
  { id: 'afternoon', emoji: '☀️', label: 'Днём' },
  { id: 'evening',   emoji: '🌙', label: 'Вечером' },
  { id: 'flexible',  emoji: '🔀', label: 'По-разному' },
]

export default function StepSchedule({ onNext }: Props) {
  const { data, setField } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h2 className="font-display font-bold text-3xl text-text mb-1">Расписание</h2>
        <p className="text-muted">AI подстроится под твой ритм жизни</p>
      </div>

      {/* Days per week */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Тренировок в неделю</label>
        <div className="flex gap-2">
          {DAYS_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setField('workouts_per_week', d)}
              className={cn(
                'flex-1 py-3.5 rounded-xl font-mono font-bold text-lg transition-all active:scale-90',
                data.workouts_per_week === d
                  ? 'bg-accent text-bg'
                  : 'bg-surface2 text-muted'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          {data.workouts_per_week <= 2 && 'Хорошо для начала. Не перегружайся.'}
          {data.workouts_per_week === 3 && 'Идеально для большинства людей. ← Рекомендуем'}
          {data.workouts_per_week === 4 && 'Отличная нагрузка для прогресса.'}
          {data.workouts_per_week >= 5 && 'Высокая нагрузка. AI добавит дни отдыха.'}
        </p>
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Длительность тренировки</label>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d.val}
              onClick={() => setField('session_duration_min', d.val)}
              className={cn(
                'py-3 rounded-xl text-sm font-medium transition-all active:scale-95',
                data.session_duration_min === d.val
                  ? 'bg-accent text-bg'
                  : 'bg-surface2 text-muted'
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time of day */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Когда удобнее</label>
        <div className="grid grid-cols-2 gap-2">
          {TIME_OPTIONS.map(t => (
            <button
              key={t.id}
              onClick={() => setField('preferred_time', t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95',
                data.preferred_time === t.id
                  ? 'bg-accent text-bg'
                  : 'bg-surface2 text-muted'
              )}
            >
              <span>{t.emoji}</span>
              {t.label}
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
