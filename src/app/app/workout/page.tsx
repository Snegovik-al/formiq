'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Clock, Dumbbell } from 'lucide-react'
import { Workout } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const DAY_TYPE_EMOJIS: Record<string, string> = {
  push: '💪', pull: '🏋️', legs: '🦵', upper: '👆',
  lower: '👇', full_body: '⚡', cardio: '🏃', mobility: '🧘', rest: '😴',
}

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workouts/list')
      .then(r => r.json())
      .then(json => {
        setWorkouts(json.workouts ?? [])
        setLoading(false)
      })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = workouts.filter(w => w.scheduled_date >= today && w.status !== 'completed')
  const completed = workouts.filter(w => w.status === 'completed')

  return (
    <div className="px-4 pt-14 pb-6 space-y-5">
      <h1 className="font-display font-bold text-2xl text-text">Тренировки</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <p className="text-sm font-medium text-muted mb-2">Предстоящие</p>
              <div className="space-y-2">
                {upcoming.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <WorkoutRow workout={w} isToday={w.scheduled_date === today} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <p className="text-sm font-medium text-muted mb-2">Завершённые</p>
              <div className="space-y-2">
                {completed.slice(0, 5).map(w => (
                  <WorkoutRow key={w.id} workout={w} />
                ))}
              </div>
            </section>
          )}

          {workouts.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell size={40} className="text-muted mx-auto mb-3" />
              <p className="text-muted">Программа ещё генерируется...</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function WorkoutRow({ workout, isToday }: { workout: Workout; isToday?: boolean }) {
  const isCompleted = workout.status === 'completed'
  const emoji = DAY_TYPE_EMOJIS[workout.day_type] ?? '🏋️'

  return (
    <Link href={isCompleted ? '#' : `/app/workout/${workout.id}`}>
      <Card className={cn(
        'flex items-center gap-3 active:scale-98 transition-transform',
        isToday && 'ring-1 ring-accent/30'
      )}>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0',
          isCompleted ? 'bg-success/10' : isToday ? 'bg-accent-dim' : 'bg-surface2'
        )}>
          {isCompleted ? '✅' : emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn('font-medium text-sm truncate', isCompleted ? 'text-muted' : 'text-text')}>
              {workout.title}
            </p>
            {isToday && <Badge variant="accent">Сегодня</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted flex items-center gap-1">
              <Calendar size={11} /> {formatDate(workout.scheduled_date)}
            </span>
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock size={11} /> {workout.estimated_duration} мин
            </span>
          </div>
        </div>
        {!isCompleted && <ChevronRight size={16} className="text-muted shrink-0" />}
      </Card>
    </Link>
  )
}
