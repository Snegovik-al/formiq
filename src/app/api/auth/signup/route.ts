import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { signToken, setSessionCookie } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Заполни все поля' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email уже зарегистрирован' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    })

    const token = await signToken({ userId: user.id, email: user.email, name: user.name ?? '' })
    await setSessionCookie(token)

    return NextResponse.json({ success: true, user: { id: user.id, email, name } })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
