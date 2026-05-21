import { create } from 'zustand'
import { OnboardingData, Gender, PrimaryGoal, FitnessLevel, WorkoutLocation, HealthRestriction } from '@/types'

const DEFAULTS: OnboardingData = {
  name: '',
  age: 28,
  gender: 'male',
  height_cm: 175,
  weight_kg: 75,
  primary_goal: 'fat_loss',
  secondary_goals: [],
  fitness_level: 'beginner',
  recent_activity: 'occasional',
  health_restrictions: [],
  forbidden_exercises: [],
  injury_areas: [],
  workouts_per_week: 3,
  session_duration_min: 45,
  preferred_time: 'flexible',
  location: 'gym',
  equipment: [],
}

interface OnboardingStore {
  data: OnboardingData
  step: number
  totalSteps: number
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: DEFAULTS,
  step: 0,
  totalSteps: 8,

  setField: (key, value) =>
    set(state => ({ data: { ...state.data, [key]: value } })),

  setStep: (step) => set({ step }),
  nextStep: () => set(state => ({ step: Math.min(state.step + 1, state.totalSteps - 1) })),
  prevStep: () => set(state => ({ step: Math.max(state.step - 1, 0) })),
  reset: () => set({ data: DEFAULTS, step: 0 }),
}))
