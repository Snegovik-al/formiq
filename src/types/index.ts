// ─── USER ────────────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type PrimaryGoal = 'fat_loss' | 'muscle_gain' | 'endurance' | 'mobility' | 'maintenance'
export type WorkoutLocation = 'home' | 'gym' | 'outdoor'
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due' | 'expired'
export type SubscriptionPlan = 'trial' | 'monthly' | 'yearly' | 'none'

export interface HealthRestriction {
  area: string
  severity: 'mild' | 'moderate' | 'severe'
  forbidden_moves?: string[]
}

export interface UserProfile {
  id: string
  email: string
  name: string
  age: number
  gender: Gender
  height_cm: number
  weight_kg: number
  primary_goal: PrimaryGoal
  secondary_goals: string[]
  fitness_level: FitnessLevel
  recent_activity: 'none' | 'occasional' | '1-2x' | '3x+'
  workouts_per_week: number
  session_duration_min: number
  preferred_time: 'morning' | 'afternoon' | 'evening' | 'flexible'
  location: WorkoutLocation
  equipment: string[]
  health_restrictions: HealthRestriction[]
  forbidden_exercises: string[]
  injury_areas: string[]
  fatigue_level: number
  recovery_score: number
  subscription: SubscriptionInfo | null
  created_at: string
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  trial_end: string | null
  current_period_end: string | null
}

// ─── WORKOUT ─────────────────────────────────────────────────────────────────

export type DayType =
  | 'push' | 'pull' | 'legs' | 'upper' | 'lower'
  | 'full_body' | 'cardio' | 'mobility' | 'rest' | 'active_recovery'

export interface WorkoutPlan {
  id: string
  user_id: string
  title: string
  generated_at: string
  week_start: string
  week_count: number
  ai_rationale: string
  status: 'active' | 'completed' | 'archived'
}

export interface Workout {
  id: string
  program_id: string
  title: string
  subtitle: string
  scheduled_date: string
  week_number: number
  day_type: DayType
  estimated_duration: number
  difficulty: 1 | 2 | 3 | 4 | 5
  primary_muscles: string[]
  ai_note: string
  status: 'scheduled' | 'completed' | 'skipped'
  content: WorkoutContent
}

export interface WorkoutContent {
  warmup: WorkoutPhase
  main: WorkoutPhase
  cooldown: WorkoutPhase
}

export interface WorkoutPhase {
  duration_min: number
  exercises: ExerciseBlock[]
}

export interface ExerciseBlock {
  exercise_id: string
  name: string
  sets: number
  reps?: string
  duration_sec?: number
  rest_sec: number
  weight_note: string
  execution_cues: string[]
  why_this_exercise: string
  safety_note?: string
  modification_easier?: string
  modification_harder?: string
  is_superset_with?: string
}

// ─── WORKOUT LOG ─────────────────────────────────────────────────────────────

export interface SetLog {
  set: number
  reps: number
  weight: number
  completed: boolean
  rpe?: number
}

export interface ExerciseLog {
  exercise_id: string
  exercise_name: string
  sets_data: SetLog[]
  notes?: string
}

export interface WorkoutLog {
  id: string
  workout_id: string
  started_at: string
  completed_at?: string
  duration_min?: number
  completion_pct: number
  perceived_effort?: number
  notes?: string
  exercises_data: ExerciseLog[]
}

// ─── EXERCISE ─────────────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'abs' | 'quads' | 'hamstrings'
  | 'glutes' | 'calves' | 'hip_flexors' | 'lats' | 'traps'
  | 'rhomboids' | 'rear_delts'

export type Equipment =
  | 'bodyweight' | 'dumbbell' | 'barbell' | 'kettlebell'
  | 'resistance_band' | 'pullup_bar' | 'bench' | 'cable'
  | 'machine' | 'mat' | 'rope' | 'trx'

export interface ExerciseMistake {
  description: string
  consequence: string
  correction: string
}

export interface ExerciseVariation {
  id: string
  name: string
  type: 'easier' | 'harder' | 'alternative'
}

export interface Exercise {
  id: string
  name: string
  name_en?: string
  category: string
  movement_pattern: string
  modality: 'strength' | 'cardio' | 'mobility' | 'stability'
  primary_muscles: MuscleGroup[]
  secondary_muscles: MuscleGroup[]
  equipment: Equipment[]
  location: WorkoutLocation[]
  difficulty: 1 | 2 | 3 | 4 | 5
  min_fitness_level: FitnessLevel
  default_sets: [number, number]
  default_reps: [number, number]
  default_rest_sec: number
  tempo: string
  breathing: string
  contraindications: string[]
  risk_level: 'low' | 'medium' | 'high'
  common_mistakes: ExerciseMistake[]
  setup_steps: string[]
  execution_steps: string[]
  key_cues: string[]
  safety_tips: string[]
  easier_variations: string[]
  harder_variations: string[]
  alternatives: string[]
  thumbnail_url?: string
  gif_url?: string
  video_url?: string
  tags: string[]
  is_compound: boolean
  is_bilateral: boolean
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

export interface StrengthRecord {
  exercise_id: string
  exercise_name: string
  date: string
  weight_kg: number
  reps: number
  estimated_1rm: number
}

export interface WeeklyVolume {
  week: string
  sets: number
  reps: number
  total_weight: number
  workouts_count: number
}

export interface ProgressSummary {
  total_workouts: number
  total_duration_min: number
  current_streak: number
  best_streak: number
  this_week_count: number
  target_week_count: number
  strength_gain_pct: number
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

export interface OnboardingData {
  name: string
  age: number
  gender: Gender
  height_cm: number
  weight_kg: number
  primary_goal: PrimaryGoal
  secondary_goals: string[]
  fitness_level: FitnessLevel
  recent_activity: string
  health_restrictions: HealthRestriction[]
  forbidden_exercises: string[]
  injury_areas: string[]
  workouts_per_week: number
  session_duration_min: number
  preferred_time: string
  location: WorkoutLocation
  equipment: string[]
}
