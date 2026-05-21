'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, ChevronLeft, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Workout, ExerciseBlock, SetLog, ExerciseLog } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { RestTimer } from '@/components/workout/RestTimer'
import { SetLogger } from '@/components/workout/SetLogger'
import { cn } from '@/lib/utils'

type Phase = 'warmup' | 'main' | 'cooldown'

export default function WorkoutPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const startTime = useRef(Date.now())

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [phase, setPhase] = useState<Phase>('warmup')
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [showRest, setShowRest] = useState(false)
  const [showCues, setShowCues] = useState(false)
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [completing, setCompleting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then(r => r.json())
      .then(json => { if (json.workout) setWorkout(json.workout) })
  }, [id])

  const currentExercises: ExerciseBlock[] = workout?.content[phase]?.exercises ?? []
  const currentExercise = currentExercises[exerciseIdx]

  const totalExercises = workout
    ? (workout.content.warmup?.exercises?.length ?? 0) + (workout.content.main?.exercises?.length ?? 0)
    : 0

  const currentGlobalIdx = phase === 'warmup'
    ? exerciseIdx
    : phase === 'main'
      ? (workout?.content.warmup?.exercises?.length ?? 0) + exerciseIdx
      : totalExercises

  const progress = totalExercises > 0 ? (currentGlobalIdx / totalExercises) * 100 : 0

  function logSet(setData: Omit<SetLog, 'set'>) {
    const entry: SetLog = { set: currentSet, ...setData }
    setLogs(prev => {
      const existing = prev.findIndex(l => l.exercise_id === currentExercise.exercise_id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], sets_data: [...updated[existing].sets_data, entry] }
        return updated
      }
      return [...prev, { exercise_id: currentExercise.exercise_id, exercise_name: currentExercise.name, sets_data: [entry] }]
    })
  }

  function handleSetComplete(weight: number, reps: number) {
    logSet({ reps, weight, completed: true })
    if (currentSet < currentExercise.sets) {
      setCurrentSet(s => s + 1)
      setShowRest(true)
    } else {
      goNextExercise()
    }
  }

  function goNextExercise() {
    setCurrentSet(1)
    setShowRest(false)
    setShowCues(false)
    const nextIdx = exerciseIdx + 1
    if (nextIdx < currentExercises.length) {
      setExerciseIdx(nextIdx)
    } else {
      if (phase === 'warmup') { setPhase('main'); setExerciseIdx(0) }
      else if (phase === 'main') {
        if ((workout?.content.cooldown?.exercises?.length ?? 0) > 0) { setPhase('cooldown'); setExerciseIdx(0) }
        else completeWorkout()
      } else { completeWorkout() }
    }
  }

  function goPrevExercise() {
    if (exerciseIdx > 0) { setExerciseIdx(i => i - 1); setCurrentSet(1) }
    else if (phase === 'main') {
      setPhase('warmup')
      setExerciseIdx((workout?.content.warmup?.exercises?.length ?? 1) - 1)
    }
  }

  async function completeWorkout() {
    setCompleting(true)
    const duration = Math.round((Date.now() - startTime.current) / 60000)
    await fetch(`/api/workouts/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercises_data: logs, duration_min: duration, perceived_effort: 7 }),
    })
    setCompleting(false)
    setDone(true)
  }

  if (!workout) return <WorkoutSkeleton />
  if (done) return <WorkoutComplete workout={workout} onHome={() => router.replace('/app/home')} />

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 glass rounded-xl text-muted active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <ProgressBar value={progress} className="mb-1" />
          <div className="flex justify-between text-xs text-muted">
            <span className="truncate max-w-[70%]">{workout.title}</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-2 px-4 mb-4">
        {(['warmup', 'main', 'cooldown'] as Phase[]).map(p => (
          <div
            key={p}
            className={cn(
              'flex-1 h-1 rounded-full transition-all duration-300',
              phase === p ? 'bg-accent' : phase > p ? 'bg-accent/30' : 'bg-surface3'
            )}
          />
        ))}
      </div>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {showRest && (
          <RestTimer
            seconds={currentExercise.rest_sec}
            onDone={() => setShowRest(false)}
            nextInfo={`Сет ${currentSet} из ${currentExercise.sets} · ${currentExercise.name}`}
          />
        )}
      </AnimatePresence>

      {/* Exercise content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${exerciseIdx}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className="flex-1 px-4 space-y-3 pb-4"
        >
          {/* Exercise card */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wider font-medium">
                {phase === 'warmup' ? 'Разминка' : phase === 'cooldown' ? 'Заминка' : 'Основная часть'}
              </span>
              <span className="text-xs text-muted font-mono">{exerciseIdx + 1} / {currentExercises.length}</span>
            </div>
            <h2 className="font-display font-bold text-xl text-text mt-1">{currentExercise?.name}</h2>
            <div className="flex gap-2 mt-3 flex-wrap">
              {currentExercise?.reps && (
                <span className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-xl font-medium">
                  {currentExercise.sets}×{currentExercise.reps}
                </span>
              )}
              <span className="text-xs bg-surface2 text-muted px-2.5 py-1 rounded-xl">
                Отдых: {currentExercise?.rest_sec}с
              </span>
              {currentExercise?.weight_note && (
                <span className="text-xs bg-surface2 text-muted px-2.5 py-1 rounded-xl">
                  {currentExercise.weight_note}
                </span>
              )}
            </div>
            {currentExercise?.why_this_exercise && (
              <p className="mt-3 text-xs text-muted leading-relaxed border-l-2 border-accent/30 pl-3">
                {currentExercise.why_this_exercise}
              </p>
            )}
          </div>

          {/* Safety warning */}
          {currentExercise?.safety_note && (
            <div className="flex items-start gap-2.5 bg-warning/8 border border-warning/20 rounded-2xl px-4 py-3">
              <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning leading-relaxed">{currentExercise.safety_note}</p>
            </div>
          )}

          {/* Set logger */}
          {phase !== 'cooldown' && currentExercise?.sets && (
            <SetLogger exercise={currentExercise} currentSet={currentSet} onSetComplete={handleSetComplete} />
          )}

          {/* Cues */}
          {currentExercise?.execution_cues?.length > 0 && (
            <div>
              <button
                onClick={() => setShowCues(!showCues)}
                className="flex items-center gap-2 text-sm text-accent font-medium py-1"
              >
                <Lightbulb size={15} />
                {showCues ? 'Скрыть' : 'Показать'} подсказки
              </button>
              <AnimatePresence>
                {showCues && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass rounded-2xl p-3 mt-2 space-y-2">
                      {currentExercise.execution_cues.map((cue, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-accent font-mono text-xs font-bold shrink-0 w-4">{i + 1}</span>
                          <p className="text-sm text-text/80 leading-snug">{cue}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Cooldown next */}
          {phase === 'cooldown' && (
            <button
              onClick={goNextExercise}
              className="w-full py-4 rounded-2xl bg-accent text-bg font-bold active:scale-95 transition-transform shadow-accent"
            >
              Следующее упражнение
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3 px-4 py-4 pb-safe">
        <button
          onClick={goPrevExercise}
          disabled={phase === 'warmup' && exerciseIdx === 0}
          className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-muted disabled:opacity-30 active:scale-95 transition-transform"
        >
          <ChevronLeft size={22} />
        </button>

        {phase === 'main' && exerciseIdx === currentExercises.length - 1 && currentSet >= currentExercise.sets ? (
          <button
            onClick={completeWorkout}
            disabled={completing}
            className="flex-1 py-3.5 rounded-2xl bg-success text-bg font-bold text-base active:scale-95 transition-transform"
          >
            {completing ? 'Сохраняем...' : 'Завершить тренировку'}
          </button>
        ) : (
          <button
            onClick={goNextExercise}
            className="flex-1 py-3.5 rounded-2xl glass text-text font-semibold text-base active:scale-95 transition-transform"
          >
            Пропустить
          </button>
        )}

        <button
          onClick={goNextExercise}
          className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-muted active:scale-95 transition-transform"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  )
}

function WorkoutComplete({ workout, onHome }: { workout: Workout; onHome: () => void }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/8 blur-3xl" />
      </div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center mb-6 shadow-accent"
      >
        <CheckCircle2 size={48} className="text-bg" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="font-display font-black text-3xl text-text mb-2">Тренировка завершена!</h1>
        <p className="text-muted mb-8">{workout.title}</p>
        <button
          onClick={onHome}
          className="w-full py-4 rounded-2xl bg-accent text-bg font-bold active:scale-95 transition-transform shadow-accent"
        >
          На главную
        </button>
      </motion.div>
    </div>
  )
}

function WorkoutSkeleton() {
  return (
    <div className="min-h-dvh px-4 pt-14 space-y-4">
      <div className="h-4 skeleton rounded-full" />
      <div className="h-48 skeleton rounded-2xl" />
      <div className="h-32 skeleton rounded-2xl" />
    </div>
  )
}
