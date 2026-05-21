import { UserProfile } from '@/types'
import { buildSafetyPromptSection } from './safety'

export const SYSTEM_PROMPT = `You are an expert personal fitness trainer and sports scientist with 15+ years of experience.
Your role is to generate safe, effective, personalized workout plans in JSON format.

CRITICAL RULES:
1. NEVER include exercises that are forbidden for the user's health restrictions
2. Always substitute exercises conflicting with injuries — use safe alternatives
3. Apply progressive overload conservatively (beginners: +5% per 2 weeks; advanced: +2.5% per week)
4. For beginners: prioritize learning movement patterns, not load
5. Always recommend deload after 3 consecutive high-intensity weeks
6. Include "why_this_exercise" for EVERY exercise — connect it to user's specific goal
7. Keep estimated_duration within ±5 minutes of target
8. Superset only complementary muscle groups (push+pull, upper+lower)
9. ALWAYS respond with valid JSON only — no markdown, no explanation text outside JSON

EXERCISE SELECTION PRINCIPLES:
- Compound movements first, isolation second
- Balance push/pull ratio (1:1 for upper body)
- Include adequate warm-up and cool-down
- Voice cues should be actionable (what to DO, not just what NOT to do)
`

export function buildUserContextPrompt(profile: UserProfile): string {
  const restrictions = profile.health_restrictions.map(r => r.area)
  const safetySection = buildSafetyPromptSection(restrictions, profile.forbidden_exercises)

  return `
USER PROFILE:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Body: ${profile.height_cm}cm, ${profile.weight_kg}kg
- Primary Goal: ${profile.primary_goal}
- Fitness Level: ${profile.fitness_level}
- Recent Activity: ${profile.recent_activity}
- Training Frequency: ${profile.workouts_per_week}x/week
- Session Duration: ${profile.session_duration_min} minutes
- Location: ${profile.location}
- Available Equipment: ${profile.equipment.length > 0 ? profile.equipment.join(', ') : 'full gym'}
- Fatigue Level: ${profile.fatigue_level}/10
- Recovery Score: ${profile.recovery_score}/10
${safetySection}
`
}

export function buildProgramGenerationPrompt(profile: UserProfile, weekNumber: number): string {
  const goalPrinciples: Record<string, string> = {
    fat_loss:    'Higher rep ranges (12-20), shorter rest (45-60s), include cardio finishers, metabolic circuits',
    muscle_gain: 'Moderate reps (6-12), longer rest (90-120s), progressive overload focus, compound movements',
    endurance:   'Circuit style, minimal rest, bodyweight + light weights, cardio integration',
    mobility:    'Mobility drills, stretching, low-load high-ROM movements, body awareness',
    maintenance: 'Balanced approach, moderate intensity, full-body balance, sustainable volume',
  }

  const intensityMap: Record<number, { label: string; pct: number }> = {
    1: { label: 'Adaptation',   pct: 60 },
    2: { label: 'Accumulation', pct: 75 },
    3: { label: 'Intensification', pct: 85 },
    4: { label: 'Deload',       pct: 50 },
  }

  const cycleWeek = ((weekNumber - 1) % 4) + 1
  const intensity = intensityMap[cycleWeek] ?? intensityMap[1]

  return `
Generate a complete ${profile.workouts_per_week}-day weekly training program for Week ${weekNumber}.

PERIODIZATION: ${intensity.label} week (${intensity.pct}% intensity)
GOAL PRINCIPLES: ${goalPrinciples[profile.primary_goal]}
${weekNumber > 1 ? `Week ${weekNumber - 1} completed — apply progressive overload where appropriate` : 'First week — prioritize technique over load'}

Return a JSON array of ${profile.workouts_per_week} workout objects. Each object must match this schema:
{
  "title": "string (e.g. 'Push Day — Грудь и трицепс')",
  "subtitle": "string (e.g. 'Неделя ${weekNumber} · День 1')",
  "day_type": "push|pull|legs|upper|lower|full_body|cardio|mobility|rest",
  "estimated_duration": number,
  "difficulty": 1-5,
  "primary_muscles": ["string"],
  "ai_note": "string (1-2 sentences personal AI note for THIS user connecting workout to their goal)",
  "content": {
    "warmup": {
      "duration_min": number,
      "exercises": [ExerciseBlock]
    },
    "main": {
      "duration_min": number,
      "exercises": [ExerciseBlock]
    },
    "cooldown": {
      "duration_min": number,
      "exercises": [ExerciseBlock]
    }
  }
}

ExerciseBlock schema:
{
  "exercise_id": "snake_case_id",
  "name": "Russian name of exercise",
  "sets": number,
  "reps": "string like '8-12' or 'до отказа'",
  "duration_sec": number (if timed, else omit),
  "rest_sec": number,
  "weight_note": "descriptive weight guidance",
  "execution_cues": ["string", "string", "string"],
  "why_this_exercise": "1 sentence connecting to user goal",
  "safety_note": "string (only if near restriction area)",
  "modification_easier": "string (optional)",
  "modification_harder": "string (optional)"
}

IMPORTANT: Return ONLY the JSON array. No markdown. No explanation.
`
}

export function buildSingleWorkoutPrompt(
  profile: UserProfile,
  dayType: string,
  weekNumber: number,
  prevSessionSummary?: string
): string {
  return `
Generate a single ${dayType} workout for Week ${weekNumber}, Day.
Target duration: ${profile.session_duration_min} minutes.
${prevSessionSummary ? `Previous session: ${prevSessionSummary}` : ''}

Apply all user profile constraints above.
Return a single workout JSON object (not an array) matching the schema.
ONLY JSON, no explanation.
`
}
