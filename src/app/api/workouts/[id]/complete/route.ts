import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { exercises_data, duration_min, perceived_effort, notes } = body

  await prisma.workout.update({
    where: { id, userId: session.userId },
    data: { status: 'completed' },
  })

  const startedAt = new Date(Date.now() - (duration_min ?? 0) * 60000)

  const log = await prisma.workoutLog.create({
    data: {
      workoutId: id,
      userId: session.userId,
      startedAt,
      completedAt: new Date(),
      durationMin: duration_min,
      completionPct: 100,
      perceivedEffort: perceived_effort,
      notes,
      exercisesData: JSON.stringify(exercises_data),
    },
  })

  if (exercises_data && Array.isArray(exercises_data)) {
    for (const ex of exercises_data) {
      const bestSet = ex.sets_data
        ?.filter((s: { completed: boolean }) => s.completed)
        ?.reduce((best: { weight: number; reps: number } | null, s: { weight: number; reps: number }) =>
          !best || s.weight * s.reps > best.weight * best.reps ? s : best
        , null)

      if (bestSet?.weight > 0) {
        const estimated1rm = Math.round(bestSet.weight * (1 + bestSet.reps / 30))
        const date = new Date().toISOString().split('T')[0]
        await prisma.strengthRecord.upsert({
          where: { userId_exerciseId_date: { userId: session.userId, exerciseId: ex.exercise_id, date } },
          create: {
            userId: session.userId,
            exerciseId: ex.exercise_id,
            date,
            weightKg: bestSet.weight,
            reps: bestSet.reps,
            estimated1rm,
          },
          update: {
            weightKg: bestSet.weight,
            reps: bestSet.reps,
            estimated1rm,
          },
        })
      }
    }
  }

  return NextResponse.json({ success: true, log_id: log.id })
}
