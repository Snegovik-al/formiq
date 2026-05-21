import Anthropic from '@anthropic-ai/sdk'
import { UserProfile, Workout, WorkoutContent } from '@/types'
import { SYSTEM_PROMPT, buildUserContextPrompt, buildProgramGenerationPrompt } from './prompts'
import { getForbiddenExercises } from './safety'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface GeneratedWorkoutRaw {
  title: string
  subtitle: string
  day_type: string
  estimated_duration: number
  difficulty: number
  primary_muscles: string[]
  ai_note: string
  content: WorkoutContent
}

export async function generateWorkoutProgram(
  profile: UserProfile,
  weekNumber: number = 1
): Promise<GeneratedWorkoutRaw[]> {
  const userContext = buildUserContextPrompt(profile)
  const generationPrompt = buildProgramGenerationPrompt(profile, weekNumber)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${userContext}\n\n${generationPrompt}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected AI response type')

  const raw = content.text.trim()
  const jsonText = raw.startsWith('[') ? raw : raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)

  const workouts: GeneratedWorkoutRaw[] = JSON.parse(jsonText)

  // Safety validation pass
  const forbidden = getForbiddenExercises(profile.injury_areas)
  return workouts.map(w => validateAndSanitizeWorkout(w, forbidden))
}

function validateAndSanitizeWorkout(
  workout: GeneratedWorkoutRaw,
  forbidden: string[]
): GeneratedWorkoutRaw {
  if (!workout.content) return workout

  const phases = ['warmup', 'main', 'cooldown'] as const
  for (const phase of phases) {
    if (!workout.content[phase]?.exercises) continue
    workout.content[phase].exercises = workout.content[phase].exercises.filter(ex => {
      if (forbidden.includes(ex.exercise_id)) {
        console.warn(`[Safety] Removed forbidden exercise: ${ex.exercise_id}`)
        return false
      }
      return true
    })
  }

  return workout
}

export async function generateFallbackWorkout(
  profile: UserProfile,
  dayType: string
): Promise<GeneratedWorkoutRaw> {
  // Template-based fallback when AI is unavailable
  const isGym = profile.location === 'gym'
  const isHome = profile.location === 'home'

  const templates: Record<string, GeneratedWorkoutRaw> = {
    full_body: {
      title: 'Full Body — Базовая тренировка',
      subtitle: 'Восстановительная · Базовый шаблон',
      day_type: 'full_body',
      estimated_duration: profile.session_duration_min,
      difficulty: profile.fitness_level === 'beginner' ? 2 : 3,
      primary_muscles: ['chest', 'back', 'legs', 'core'],
      ai_note: 'Базовая тренировка пока AI недоступен. Сосредоточься на технике.',
      content: {
        warmup: {
          duration_min: 5,
          exercises: [
            {
              exercise_id: 'jumping_jack',
              name: 'Прыжки Джека',
              sets: 2,
              duration_sec: 30,
              rest_sec: 15,
              weight_note: 'Без веса',
              execution_cues: ['Руки вверх, ноги в стороны', 'Возврат в исходное', 'Ритмично'],
              why_this_exercise: 'Разогрев всего тела',
            },
          ],
        },
        main: {
          duration_min: profile.session_duration_min - 10,
          exercises: isHome
            ? [
                {
                  exercise_id: 'push_up',
                  name: 'Отжимания',
                  sets: 3,
                  reps: '8-12',
                  rest_sec: 60,
                  weight_note: 'Своё тело',
                  execution_cues: ['Тело прямое', 'Опускайся до касания груди', 'Выдох на подъёме'],
                  why_this_exercise: 'Развитие грудных и трицепса',
                },
                {
                  exercise_id: 'squat_bodyweight',
                  name: 'Приседания',
                  sets: 3,
                  reps: '15-20',
                  rest_sec: 60,
                  weight_note: 'Своё тело',
                  execution_cues: ['Пятки в пол', 'Колени по носкам', 'Спина прямая'],
                  why_this_exercise: 'Развитие квадрицепсов и ягодиц',
                },
              ]
            : [
                {
                  exercise_id: 'goblet_squat',
                  name: 'Goblet Squat',
                  sets: 4,
                  reps: '10-12',
                  rest_sec: 90,
                  weight_note: '20–30% от веса тела',
                  execution_cues: ['Гиря у груди', 'Пятки в пол', 'Колени наружу'],
                  why_this_exercise: 'Развитие ног, базовое движение',
                },
              ],
        },
        cooldown: {
          duration_min: 5,
          exercises: [
            {
              exercise_id: 'hip_flexor_stretch',
              name: 'Растяжка сгибателей бедра',
              sets: 1,
              duration_sec: 30,
              rest_sec: 15,
              weight_note: 'Без веса',
              execution_cues: ['Одно колено на пол', 'Таз вперёд', 'Держи 30 секунд'],
              why_this_exercise: 'Восстановление после нагрузки',
            },
          ],
        },
      },
    },
  }

  return templates[dayType] ?? templates['full_body']
}
