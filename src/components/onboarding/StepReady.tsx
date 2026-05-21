'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'

interface Props { onNext: () => void }

const AI_STEPS = [
  'Анализирую твой профиль...',
  'Оцениваю уровень подготовки...',
  'Проверяю ограничения здоровья...',
  'Подбираю оптимальные нагрузки...',
  'Составляю твою программу...',
]

export default function StepReady({ onNext }: Props) {
  const { data } = useOnboardingStore()
  const router = useRouter()
  const [phase, setPhase] = useState<'summary' | 'generating' | 'done'>('summary')
  const [aiStep, setAiStep] = useState(0)
  const [loading, setLoading] = useState(false)

  async function startGeneration() {
    setPhase('generating')
    setLoading(true)

    // Animate through AI steps
    for (let i = 0; i < AI_STEPS.length; i++) {
      setAiStep(i)
      await new Promise(r => setTimeout(r, 800))
    }

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setPhase('done')
        await new Promise(r => setTimeout(r, 1200))
        router.replace('/app/home')
      }
    } catch {
      setPhase('summary')
    } finally {
      setLoading(false)
    }
  }

  const goalLabels: Record<string, string> = {
    fat_loss: 'Сжечь жир', muscle_gain: 'Набрать мышцы',
    endurance: 'Выносливость', mobility: 'Mobility', maintenance: 'Поддерживать форму',
  }

  const levelLabels: Record<string, string> = {
    beginner: 'Новичок', intermediate: 'Средний', advanced: 'Продвинутый',
  }

  const locationLabels: Record<string, string> = {
    gym: 'Зал', home: 'Дома', outdoor: 'Улица',
  }

  return (
    <div className="flex flex-col min-h-[70vh] pt-4">
      <AnimatePresence mode="wait">
        {phase === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h2 className="font-display font-bold text-3xl text-text mb-1">
                Всё готово, {data.name}!
              </h2>
              <p className="text-muted">Проверь данные и запусти AI</p>
            </div>

            <div className="bg-surface rounded-2xl p-4 space-y-3">
              <SummaryRow label="Цель" value={goalLabels[data.primary_goal]} />
              <SummaryRow label="Уровень" value={levelLabels[data.fitness_level]} />
              <SummaryRow label="Место" value={locationLabels[data.location]} />
              <SummaryRow label="Тренировок" value={`${data.workouts_per_week}×/нед · ${data.session_duration_min} мин`} />
              {data.injury_areas.length > 0 && (
                <SummaryRow label="Ограничения" value={`${data.injury_areas.length} ограничения учтены`} accent="warning" />
              )}
            </div>

            <div className="bg-accent-dim rounded-2xl p-4 border border-accent/20">
              <p className="text-sm text-accent font-medium mb-1">🤖 AI создаст для тебя:</p>
              <ul className="text-sm text-text/80 space-y-1">
                <li>• Персональную программу на 4 недели</li>
                <li>• {data.workouts_per_week * 4} тренировок с инструкциями</li>
                <li>• Автоматическую адаптацию нагрузок</li>
              </ul>
            </div>

            <Button fullWidth size="lg" onClick={startGeneration}>
              Запустить AI →
            </Button>
          </motion.div>
        )}

        {phase === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center flex-1 gap-8"
          >
            {/* Animated logo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-accent-dim flex items-center justify-center">
                <span className="font-display font-bold text-4xl text-accent animate-pulse-accent">F</span>
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-accent/30 animate-spin-slow" />
            </div>

            <div className="text-center">
              <p className="font-display font-bold text-2xl text-text mb-6">AI генерирует программу</p>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {AI_STEPS.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i <= aiStep ? 1 : 0.3, x: 0 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    {i < aiStep ? (
                      <CheckCircle2 size={16} className="text-accent shrink-0" />
                    ) : i === aiStep ? (
                      <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-surface3 shrink-0" />
                    )}
                    <span className={i <= aiStep ? 'text-text' : 'text-muted'}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center flex-1 gap-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center"
            >
              <CheckCircle2 size={40} className="text-bg" />
            </motion.div>
            <div>
              <h2 className="font-display font-bold text-3xl text-text mb-2">Программа готова!</h2>
              <p className="text-muted">Переходим к тренировкам...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm font-semibold ${accent === 'warning' ? 'text-warning' : 'text-text'}`}>
        {value}
      </span>
    </div>
  )
}
