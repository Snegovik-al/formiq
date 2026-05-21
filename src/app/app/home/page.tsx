'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Flame, ChevronRight, Zap, Trophy } from 'lucide-react'
import { Workout } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getGreeting, getDayOfWeek } from '@/lib/utils'

interface HomeData {
  workout: Workout | null
  upcoming: Workout | null
  streak: number
  completedThisWeek: number
  targetPerWeek: number
  aiInsight: string
  userName: string
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [todayRes, statsRes, meRes] = await Promise.all([
          fetch('/api/workouts/today'),
          fetch('/api/stats'),
          fetch('/api/auth/me'),
        ])
        const [todayJson, statsJson, meJson] = await Promise.all([
          todayRes.json(),
          statsRes.json(),
          meRes.json(),
        ])

        const logs: string[] = (statsJson.logs ?? []).map((l: { completed_at: string }) => l.completed_at)
        const streak = calcStreak(logs)
        const completedThisWeek = getThisWeekCount(logs)

        const insights = [
          'Регулярность важнее интенсивности. Ты на правильном пути!',
          'AI отслеживает прогресс и скоро усилит нагрузку.',
          'Хороший сон = лучший прогресс. Спи 7–9 часов.',
          'Каждая тренировка делает тебя сильнее — буквально.',
        ]

        setData({
          workout: todayJson.workout ?? null,
          upcoming: todayJson.upcoming ?? null,
          streak,
          completedThisWeek,
          targetPerWeek: statsJson.workoutsPerWeek ?? 3,
          aiInsight: insights[Math.floor(Math.random() * insights.length)],
          userName: meJson.user?.name?.split(' ')[0] ?? 'друг',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <HomeSkeleton />

  const { workout, upcoming, streak, completedThisWeek, targetPerWeek, aiInsight, userName } = data ?? {
    workout: null, upcoming: null, streak: 0, completedThisWeek: 0, targetPerWeek: 3, aiInsight: '', userName: 'друг',
  }

  return (
    <div className="px-4 pt-14 pb-28 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-muted text-sm">{getGreeting()},</p>
          <h1 className="font-display font-black text-2xl text-text">{userName}</h1>
        </div>
        <button className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted active:scale-95 transition-transform">
          <Bell size={18} />
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {workout ? (
          <TodayWorkoutCard workout={workout} />
        ) : upcoming ? (
          <UpcomingWorkoutCard workout={upcoming} />
        ) : (
          <RestDayCard />
        )}
      </motion.div>

      {/* Week progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text">Эта неделя</p>
            <span className="text-xs text-muted font-mono">{completedThisWeek} / {targetPerWeek}</span>
          </div>
          <WeekDots completed={completedThisWeek} target={targetPerWeek} />
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-warning/10 flex items-center justify-center">
              <Flame size={14} className="text-warning" />
            </div>
            <span className="text-xs text-muted">Серия</span>
          </div>
          <p className="font-mono font-black text-3xl text-text leading-none">{streak}</p>
          <p className="text-xs text-muted mt-1">дней подряд</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center">
              <Trophy size={14} className="text-accent" />
            </div>
            <span className="text-xs text-muted">Неделя</span>
          </div>
          <p className="font-mono font-black text-3xl text-text leading-none">{completedThisWeek}</p>
          <p className="text-xs text-muted mt-1">тренировок</p>
        </Card>
      </motion.div>

      {/* AI insight */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card variant="gold">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl glass-gold flex items-center justify-center shrink-0">
              <Zap size={14} className="text-gold" />
            </div>
            <div>
              <p className="text-xs text-gold font-semibold mb-1">AI Инсайт</p>
              <p className="text-sm text-text/80 leading-relaxed">{aiInsight}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function TodayWorkoutCard({ workout }: { workout: Workout }) {
  return (
    <Card variant="glass" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-accent/5 -translate-y-12 translate-x-12 pointer-events-none" />
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex-1 min-w-0">
          <Badge variant="accent" className="mb-2">Сегодня</Badge>
          <h2 className="font-display font-bold text-xl text-text leading-tight">{workout.title}</h2>
          <p className="text-muted text-sm mt-0.5">{workout.subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-3 shrink-0">
          <span className="font-mono text-sm font-bold text-text">{workout.estimated_duration} мин</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < workout.difficulty ? 'bg-accent' : 'bg-surface3'}`} />
            ))}
          </div>
        </div>
      </div>
      {workout.ai_note && (
        <p className="text-xs text-muted bg-surface2/80 rounded-2xl px-3 py-2.5 mb-4 leading-relaxed">
          {workout.ai_note}
        </p>
      )}
      <Link
        href={`/app/workout/${workout.id}`}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-accent text-bg font-bold active:scale-95 transition-transform shadow-accent"
      >
        Начать тренировку
        <ChevronRight size={18} />
      </Link>
    </Card>
  )
}

function UpcomingWorkoutCard({ workout }: { workout: Workout }) {
  return (
    <Card>
      <p className="text-xs text-muted mb-2">Следующая тренировка</p>
      <h2 className="font-bold text-lg text-text mb-1">{workout.title}</h2>
      <p className="text-sm text-muted mb-4">
        {getDayOfWeek(new Date(workout.scheduled_date))} · {workout.estimated_duration} мин
      </p>
      <div className="glass rounded-2xl px-4 py-3 text-sm text-muted">
        Сегодня день отдыха — дай мышцам восстановиться
      </div>
    </Card>
  )
}

function RestDayCard() {
  return (
    <Card>
      <div className="text-center py-6">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="font-bold text-lg text-text mb-1">Все тренировки недели выполнены!</h2>
        <p className="text-sm text-muted">Отличная работа. Программа следующей недели уже готова.</p>
      </div>
    </Card>
  )
}

function WeekDots({ completed, target }: { completed: number; target: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: target }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-2 rounded-full transition-all duration-300 ${
            i < completed ? 'bg-accent' : 'bg-surface3'
          }`}
        />
      ))}
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="px-4 pt-14 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-20 skeleton rounded-full" />
          <div className="h-6 w-32 skeleton rounded-full" />
        </div>
        <div className="w-10 h-10 skeleton rounded-2xl" />
      </div>
      <div className="h-44 skeleton rounded-2xl" />
      <div className="h-16 skeleton rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 skeleton rounded-2xl" />
        <div className="h-24 skeleton rounded-2xl" />
      </div>
    </div>
  )
}

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0
  let streak = 0
  let current = new Date()
  current.setHours(0, 0, 0, 0)
  const sorted = [...new Set(dates.map(d => new Date(d).toDateString()))].sort().reverse()
  for (const dateStr of sorted) {
    const date = new Date(dateStr)
    const diff = Math.floor((current.getTime() - date.getTime()) / 86400000)
    if (diff <= 1) { streak++; current = date }
    else break
  }
  return streak
}

function getThisWeekCount(dates: string[]): number {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() + 1)
  start.setHours(0, 0, 0, 0)
  return dates.filter(d => new Date(d) >= start).length
}
