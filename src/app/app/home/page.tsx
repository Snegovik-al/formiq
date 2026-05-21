'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, ChevronRight, Zap, Trophy } from 'lucide-react'
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
          todayRes.json(), statsRes.json(), meRes.json(),
        ])
        const logs: string[] = (statsJson.logs ?? []).map((l: { completed_at: string }) => l.completed_at)
        const streak = calcStreak(logs)
        const completedThisWeek = getThisWeekCount(logs)
        const insights = [
          'Регулярность важнее интенсивности. Ты на правильном пути.',
          'AI отслеживает прогресс и скоро усилит нагрузку.',
          'Хороший сон — лучший прогресс. Спи 7–9 часов.',
          'Каждая тренировка делает тебя сильнее.',
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
    <div className="px-4 pt-14 pb-28 space-y-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <p className="text-[11px] uppercase tracking-[0.07em] text-muted mb-0.5">{getGreeting()},</p>
        <h1 className="font-display font-normal text-dark" style={{ fontSize: 36, lineHeight: 1.1 }}>
          {userName}
        </h1>
      </motion.div>

      {/* Today workout */}
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
            <p className="text-[11px] uppercase tracking-[0.05em] text-muted">Эта неделя</p>
            <span className="text-[12px] text-muted">{completedThisWeek} из {targetPerWeek}</span>
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
            <Flame size={14} className="text-warning" />
            <span className="text-[11px] uppercase tracking-[0.04em] text-muted">Серия</span>
          </div>
          <p className="font-display font-normal text-dark" style={{ fontSize: 38, lineHeight: 1 }}>{streak}</p>
          <p className="text-[11px] text-muted mt-1">дней подряд</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={14} className="text-accent" />
            <span className="text-[11px] uppercase tracking-[0.04em] text-muted">Неделя</span>
          </div>
          <p className="font-display font-normal text-dark" style={{ fontSize: 38, lineHeight: 1 }}>{completedThisWeek}</p>
          <p className="text-[11px] text-muted mt-1">тренировок</p>
        </Card>
      </motion.div>

      {/* AI insight */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/13 flex items-center justify-center shrink-0">
              <Zap size={13} className="text-accent" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.05em] text-muted mb-1">AI Инсайт</p>
              <p className="text-[13px] text-text/80 leading-relaxed">{aiInsight}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function TodayWorkoutCard({ workout }: { workout: Workout }) {
  return (
    <div
      className="rounded-[24px] p-[22px] relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(123,143,122,0.92), rgba(65,70,75,0.95))' }}
    >
      <div
        className="absolute -top-10 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Badge variant="accent" className="mb-2 bg-white/15 text-white/90 border-white/20">Сегодня</Badge>
            <h2 className="font-display font-normal text-white" style={{ fontSize: 24, lineHeight: 1.15 }}>
              {workout.title}
            </h2>
            {workout.subtitle && (
              <p className="text-[12px] text-white/60 mt-1">{workout.subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
            <span className="text-[13px] font-medium text-white/90">{workout.estimated_duration} мин</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < workout.difficulty ? 'bg-white/80' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>
        {workout.ai_note && (
          <p className="text-[12px] text-white/65 leading-relaxed mb-4 border-l border-white/25 pl-3">
            {workout.ai_note}
          </p>
        )}
        <Link
          href={`/app/workout/${workout.id}`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white text-[15px] font-medium tracking-[0.02em] active:scale-95 transition-transform"
          style={{ background: 'rgba(255,255,255,0.18)', border: '0.5px solid rgba(255,255,255,0.35)' }}
        >
          Начать тренировку
          <ChevronRight size={17} />
        </Link>
      </div>
    </div>
  )
}

function UpcomingWorkoutCard({ workout }: { workout: Workout }) {
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-[0.05em] text-muted mb-2">Следующая тренировка</p>
      <h2 className="font-display font-normal text-dark text-[22px] mb-1">{workout.title}</h2>
      <p className="text-[12px] text-muted mb-4">
        {getDayOfWeek(new Date(workout.scheduled_date))} · {workout.estimated_duration} мин
      </p>
      <div
        className="rounded-[14px] px-4 py-3 text-[13px] text-muted"
        style={{ background: 'rgba(217,210,195,0.3)', border: '0.5px solid rgba(217,210,195,0.85)' }}
      >
        Сегодня день отдыха — дай мышцам восстановиться
      </div>
    </Card>
  )
}

function RestDayCard() {
  return (
    <Card>
      <div className="text-center py-6">
        <h2 className="font-display font-normal text-dark text-[22px] mb-2">Все тренировки недели выполнены</h2>
        <p className="text-[13px] text-muted">Программа следующей недели уже готова.</p>
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
          className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${
            i < completed ? 'bg-accent' : 'bg-surface3'
          }`}
        />
      ))}
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="px-4 pt-14 pb-28 space-y-3">
      <div className="space-y-1.5 mb-2">
        <div className="h-3 w-16 skeleton rounded-full" />
        <div className="h-9 w-36 skeleton rounded-full" />
      </div>
      <div className="h-48 skeleton rounded-[24px]" />
      <div className="h-16 skeleton rounded-[20px]" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 skeleton rounded-[20px]" />
        <div className="h-28 skeleton rounded-[20px]" />
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
