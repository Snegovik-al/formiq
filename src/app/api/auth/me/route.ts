import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      subscription: true,
    },
  })

  if (!user) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      hasProfile: !!user.profile,
      subscription: user.subscription,
    },
  })
}
