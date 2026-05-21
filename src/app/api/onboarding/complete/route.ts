import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'
import { generateWorkoutProgram, generateFallbackWorkout } from '@/lib/ai/generate'
import { OnboardingData, UserProfile } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const onboardingData: OnboardingData = await request.json()

    // Save user profile
    await prisma.userProfile.upsert({
      where: { id: session.userId },
      create: {
        id: session.userId,
        age: onboardingData.age,
        gender: onboardingData.gender,
        heightCm: onboardingData.height_cm,
        weightKg: onboardingData.weight_kg,
        primaryGoal: onboardingData.primary_goal,
        secondaryGoals: JSON.stringify(onboardingData.secondary_goals),
        fitnessLevel: onboardingData.fitness_level,
        recentActivity: onboardingData.recent_activity,
        workoutsPerWeek: onboardingData.workouts_per_week,
        sessionDurationMin: onboardingData.session_duration_min,
        preferredTime: onboardingData.preferred_time,
        location: onboardingData.location,
        equipment: JSON.stringify(onboardingData.equipment),
        healthRestrictions: JSON.stringify(onboardingData.health_restrictions),
        forbiddenExercises: JSON.stringify(onboardingData.forbidden_exercises),
        injuryAreas: JSON.stringify(onboardingData.injury_areas),
      },
      update: {
        age: onboardingData.age,
        gender: onboardingData.gender,
        heightCm: onboardingData.height_cm,
        weightKg: onboardingData.weight_kg,
        primaryGoal: onboardingData.primary_goal,
        secondaryGoals: JSON.stringify(onboardingData.secondary_goals),
        fitnessLevel: onboardingData.fitness_level,
        recentActivity: onboardingData.recent_activity,
        workoutsPerWeek: onboardingData.workouts_per_week,
        sessionDurationMin: onboardingData.session_duration_min,
        preferredTime: onboardingData.preferred_time,
        location: onboardingData.location,
        equipment: JSON.stringify(onboardingData.equipment),
        healthRestrictions: JSON.stringify(onboardingData.health_restrictions),
        forbiddenExercises: JSON.stringify(onboardingData.forbidden_exercises),
        injuryAreas: JSON.stringify(onboardingData.injury_areas),
      },
    })

    // Update user name
    if (onboardingData.name) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name: onboardingData.name },
      })
    }

    // Build profile for AI
    const profile: UserProfile = {
      ...onboardingData,
      id: session.userId,
      email: session.email,
      name: onboardingData.name,
      recent_activity: onboardingData.recent_activity as UserProfile['recent_activity'],
      preferred_time: onboardingData.preferred_time as UserProfile['preferred_time'],
      fatigue_level: 3,
      recovery_score: 7,
      subscription: null,
      created_at: new Date().toISOString(),
    }

    // Generate AI workout program
    let workouts
    try {
      workouts = await generateWorkoutProgram(profile, 1)
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError)
      const dayTypes = getDayTypes(profile.workouts_per_week)
      workouts = await Promise.all(dayTypes.map(dt => generateFallbackWorkout(profile, dt)))
    }

    // Save program
    const weekStart = getMonday(new Date())
    const program = await prisma.program.create({
      data: {
        userId: session.userId,
        title: `Программа для ${onboardingData.name}`,
        weekStart: weekStart.toISOString().split('T')[0],
        weekCount: 4,
        aiRationale: `Цель: ${onboardingData.primary_goal}, уровень: ${onboardingData.fitness_level}`,
        status: 'active',
      },
    })

    // Save workouts
    const offsets = getWorkoutOffsets(onboardingData.workouts_per_week)
    for (let i = 0; i < workouts.length; i++) {
      const w = workouts[i]
      const date = new Date(weekStart)
      date.setDate(date.getDate() + (offsets[i] ?? i))

      await prisma.workout.create({
        data: {
          programId: program.id,
          userId: session.userId,
          title: w.title,
          subtitle: w.subtitle,
          scheduledDate: date.toISOString().split('T')[0],
          weekNumber: 1,
          dayType: w.day_type,
          estimatedMin: w.estimated_duration,
          difficulty: w.difficulty,
          status: 'scheduled',
          aiNote: w.ai_note,
          content: JSON.stringify(w.content),
        },
      })
    }

    // Create trial subscription (7 days)
    await prisma.subscription.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        planId: 'trial',
        status: 'trialing',
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      update: {
        planId: 'trial',
        status: 'trialing',
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json({ success: true, program_id: program.id })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDayTypes(perWeek: number): string[] {
  const patterns: Record<number, string[]> = {
    2: ['full_body', 'full_body'],
    3: ['push', 'legs', 'pull'],
    4: ['push', 'pull', 'legs', 'upper'],
    5: ['push', 'pull', 'legs', 'upper', 'lower'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
  }
  return patterns[perWeek] ?? patterns[3]
}

function getWorkoutOffsets(perWeek: number): number[] {
  const offsets: Record<number, number[]> = {
    2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4],
    5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5],
  }
  return offsets[perWeek] ?? offsets[3]
}
