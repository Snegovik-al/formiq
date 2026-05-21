import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workouts = await prisma.workout.findMany({
    where: { userId: session.userId },
    orderBy: { scheduledDate: 'asc' },
    take: 20,
  })

  return NextResponse.json({
    workouts: workouts.map(w => ({
      id: w.id,
      title: w.title,
      subtitle: w.subtitle,
      scheduled_date: w.scheduledDate,
      week_number: w.weekNumber,
      day_type: w.dayType,
      estimated_duration: w.estimatedMin,
      difficulty: w.difficulty,
      status: w.status,
      ai_note: w.aiNote,
      content: JSON.parse(w.content),
    })),
  })
}
