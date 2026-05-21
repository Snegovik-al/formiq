'use client'

import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { PrimaryGoal } from '@/types'

interface Props { onNext: () => void }

const GOALS: { id: PrimaryGoal; emoji: string; label: string; desc: string }[] = [
  { id: 'fat_loss',     emoji: '🔥', label: 'Сжечь жир',        desc: 'Похудеть и стать рельефнее' },
  { id: 'muscle_gain',  emoji: '💪', label: 'Набрать мышцы',     desc: 'Увеличить силу и объём' },
  { id: 'endurance',    emoji: '⚡', label: 'Выносливость',      desc: 'Бег, кардио, функционал' },
  { id: 'mobility',     emoji: '🧘', label: 'Гибкость и mobility', desc: 'Подвижность суставов' },
  { id: 'maintenance',  emoji: '🎯', label: 'Поддерживать форму', desc: 'Здоровье и баланс' },
]

export default function StepGoal({ onNext }: Props) {
  const { data, setField } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-5 pt-4">
      <div>
        <h2 className="font-display font-bold text-3xl text-text mb-1">Твоя главная цель</h2>
        <p className="text-muted">AI построит программу вокруг этого</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => setField('primary_goal', g.id)}
            className={cn(
              'flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all active:scale-98 text-left',
              data.primary_goal === g.id
                ? 'border-accent bg-accent-dim'
                : 'border-transparent bg-surface2'
            )}
          >
            <span className="text-2xl">{g.emoji}</span>
            <div>
              <p className={cn('font-semibold', data.primary_goal === g.id ? 'text-accent' : 'text-text')}>
                {g.label}
              </p>
              <p className="text-xs text-muted mt-0.5">{g.desc}</p>
            </div>
            {data.primary_goal === g.id && (
              <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <Button fullWidth size="lg" onClick={onNext} className="mt-auto">
        Далее
      </Button>
    </div>
  )
}
