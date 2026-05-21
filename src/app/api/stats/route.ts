import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [logs, strength, profile] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId: session.userId },
      orderBy: { completedAt: 'desc' },
      take: 60,
      select: { completedAt: true, durationMin: true },
    }),
    prisma.strengthRecord.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      take: 20,
      select: { exerciseId: true, weightKg: true, date: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: session.userId },
      select: { workoutsPerWeek: true },
    }),
  ])

  return NextResponse.json({
    logs: logs.map(l => ({ completed_at: l.completedAt?.toISOString() ?? new Date().toISOString(), duration_min: l.durationMin })),
    strength: strength.map(s => ({ exercise_id: s.exerciseId, weight_kg: s.weightKg, date: s.date })),
    workoutsPerWeek: profile?.workoutsPerWeek ?? 3,
  })
}
