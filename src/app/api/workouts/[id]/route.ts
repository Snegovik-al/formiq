import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const w = await prisma.workout.findFirst({ where: { id, userId: session.userId } })
  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    workout: {
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
    },
  })
}
