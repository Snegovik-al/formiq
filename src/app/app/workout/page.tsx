'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Clock } from 'lucide-react'
import { Workout } from '@/types'
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
      .then(json => { setWorkouts(json.workouts ?? []); setLoading(false) })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = workouts.filter(w => w.scheduled_date >= today && w.status !== 'completed')
  const completed = workouts.filter(w => w.status === 'completed')

  return (
    <div className="px-4 pt-14 pb-28 space-y-5">
      <h1 className="font-display font-normal text-dark mb-2" style={{ fontSize: 32 }}>Тренировки</h1>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-[18px]" />
          ))}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <p className="text-[11px] uppercase tracking-[0.05em] text-muted mb-3">Предстоящие</p>
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
              <p className="text-[11px] uppercase tracking-[0.05em] text-muted mb-3">Завершённые</p>
              <div className="space-y-2">
                {completed.slice(0, 5).map(w => (
                  <WorkoutRow key={w.id} workout={w} />
                ))}
              </div>
            </section>
          )}

          {workouts.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display font-normal text-dark text-[22px] mb-2">Программа готовится</p>
              <p className="text-[13px] text-muted">AI генерирует твой план тренировок...</p>
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
      <div
        className={cn(
          'glass flex items-center gap-3 rounded-[18px] overflow-hidden active:scale-[0.98] transition-transform',
          isToday && 'border-accent/30'
        )}
        style={isToday ? { borderColor: 'rgba(123,143,122,0.35)' } : undefined}
      >
        <div
          className={cn(
            'w-[78px] h-[78px] flex items-center justify-center text-[28px] shrink-0',
            isCompleted ? 'bg-accent/10' : isToday ? 'bg-accent/13' : 'bg-surface2/60'
          )}
        >
          {isCompleted ? '✅' : emoji}
        </div>
        <div className="flex-1 min-w-0 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn('font-medium text-[14px] truncate', isCompleted ? 'text-muted line-through' : 'text-text')}>
              {workout.title}
            </p>
            {isToday && <Badge variant="accent">Сегодня</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-muted flex items-center gap-1">
              <Calendar size={10} /> {formatDate(workout.scheduled_date)}
            </span>
            <span className="text-[11px] text-muted flex items-center gap-1">
              <Clock size={10} /> {workout.estimated_duration} мин
            </span>
          </div>
        </div>
        {!isCompleted && <ChevronRight size={15} className="text-muted shrink-0 mr-3" />}
      </div>
    </Link>
  )
}
