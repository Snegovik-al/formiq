'use client'

import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props { onNext: () => void }

const GENDERS = [
  { id: 'male',   label: 'Мужчина' },
  { id: 'female', label: 'Женщина' },
  { id: 'other',  label: 'Другое' },
] as const

export default function StepProfile({ onNext }: Props) {
  const { data, setField } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h2 className="font-display font-bold text-3xl text-text mb-1">Познакомимся!</h2>
        <p className="text-muted">AI использует эти данные для точной программы</p>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Как тебя зовут?</label>
        <input
          value={data.name}
          onChange={e => setField('name', e.target.value)}
          placeholder="Твоё имя"
          className="w-full px-4 py-3.5 rounded-xl bg-surface2 text-text placeholder:text-muted border border-transparent focus:border-accent/50 focus:outline-none text-base"
        />
      </div>

      {/* Age drum */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Возраст</label>
        <div className="flex items-center justify-between bg-surface2 rounded-xl px-2 py-2">
          <button
            onClick={() => setField('age', Math.max(16, data.age - 1))}
            className="w-12 h-12 rounded-xl bg-surface3 text-text text-xl font-bold active:scale-90 transition-transform"
          >−</button>
          <span className="font-mono text-3xl font-bold text-text">{data.age}</span>
          <button
            onClick={() => setField('age', Math.min(80, data.age + 1))}
            className="w-12 h-12 rounded-xl bg-surface3 text-text text-xl font-bold active:scale-90 transition-transform"
          >+</button>
        </div>
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text/80">Пол</label>
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map(g => (
            <button
              key={g.id}
              onClick={() => setField('gender', g.id)}
              className={cn(
                'py-3 rounded-xl text-sm font-medium transition-all active:scale-95',
                data.gender === g.id
                  ? 'bg-accent text-bg'
                  : 'bg-surface2 text-muted'
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={onNext}
        disabled={!data.name.trim()}
        className="mt-auto"
      >
        Далее
      </Button>
    </div>
  )
}
