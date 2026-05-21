import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const workout = await prisma.workout.findFirst({
    where: { userId: session.userId, scheduledDate: today, status: 'scheduled' },
  })

  if (!workout) {
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()))
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    const upcoming = await prisma.workout.findFirst({
      where: {
        userId: session.userId,
        status: 'scheduled',
        scheduledDate: { gte: today, lte: weekEndStr },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    return NextResponse.json({ workout: null, upcoming: upcoming ? mapWorkout(upcoming) : null })
  }

  return NextResponse.json({ workout: mapWorkout(workout), upcoming: null })
}

function mapWorkout(w: {
  id: string; title: string; subtitle: string | null; scheduledDate: string;
  weekNumber: number; dayType: string; estimatedMin: number | null; difficulty: number | null;
  status: string; aiNote: string | null; content: string;
}) {
  return {
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
  }
}
