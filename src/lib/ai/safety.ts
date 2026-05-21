import { HealthRestriction } from '@/types'

interface SafetyRule {
  restriction: string
  forbidden_exercises: string[]
  warning_exercises: string[]
  safe_alternatives: Record<string, string>
}

const SAFETY_RULES: SafetyRule[] = [
  {
    restriction: 'lower_back',
    forbidden_exercises: [
      'deadlift_conventional', 'good_morning', 'sit_up',
      'leg_press_heavy', 'back_extension_weighted', 'jefferson_squat'
    ],
    warning_exercises: ['barbell_squat', 'romanian_deadlift', 'bent_over_row'],
    safe_alternatives: {
      'deadlift_conventional': 'trap_bar_deadlift',
      'sit_up': 'dead_bug',
      'good_morning': 'hip_hinge_band',
      'leg_press_heavy': 'goblet_squat',
      'bent_over_row': 'seated_cable_row',
    },
  },
  {
    restriction: 'knee',
    forbidden_exercises: [
      'deep_squat', 'leg_extension_heavy', 'jump_squat',
      'running_impact', 'barbell_lunge', 'sissy_squat'
    ],
    warning_exercises: ['lunge', 'step_up', 'leg_press'],
    safe_alternatives: {
      'deep_squat': 'box_squat_parallel',
      'jump_squat': 'step_up_controlled',
      'lunge': 'reverse_lunge_controlled',
      'leg_extension_heavy': 'terminal_knee_extension',
    },
  },
  {
    restriction: 'shoulder',
    forbidden_exercises: [
      'behind_neck_press', 'upright_row', 'dips_heavy',
      'overhead_barbell_press', 'wide_grip_bench', 'behind_neck_lat_pulldown'
    ],
    warning_exercises: ['lateral_raise_heavy', 'dumbbell_bench_press'],
    safe_alternatives: {
      'overhead_barbell_press': 'landmine_press',
      'upright_row': 'face_pull',
      'dips_heavy': 'chest_press_machine',
      'behind_neck_press': 'dumbbell_shoulder_press_neutral',
    },
  },
  {
    restriction: 'neck',
    forbidden_exercises: [
      'behind_neck_press', 'behind_neck_lat_pulldown',
      'neck_extension_weighted', 'barbell_shrug_behind'
    ],
    warning_exercises: ['overhead_press', 'lat_pulldown'],
    safe_alternatives: {
      'behind_neck_press': 'seated_dumbbell_press',
      'behind_neck_lat_pulldown': 'front_lat_pulldown',
    },
  },
  {
    restriction: 'wrist',
    forbidden_exercises: [
      'barbell_curl_standard', 'front_squat', 'clean_and_press',
      'push_up_standard', 'barbell_bench_press'
    ],
    warning_exercises: ['dumbbell_curl', 'plank'],
    safe_alternatives: {
      'push_up_standard': 'push_up_on_fists',
      'barbell_bench_press': 'dumbbell_bench_neutral',
      'plank': 'plank_on_forearms',
      'barbell_curl_standard': 'hammer_curl',
    },
  },
  {
    restriction: 'hypertension',
    forbidden_exercises: [
      'valsalva_heavy', 'inverted_row_heavy', 'handstand',
      'heavy_isometric_holds'
    ],
    warning_exercises: ['deadlift', 'heavy_squat', 'overhead_press'],
    safe_alternatives: {
      'inverted_row_heavy': 'seated_row_moderate',
    },
  },
  {
    restriction: 'heart',
    forbidden_exercises: [
      'high_intensity_interval', 'sprint', 'heavy_compound_max'
    ],
    warning_exercises: ['cardio_moderate', 'circuit_training'],
    safe_alternatives: {
      'high_intensity_interval': 'steady_state_cardio',
      'sprint': 'brisk_walk',
    },
  },
  {
    restriction: 'pregnancy',
    forbidden_exercises: [
      'prone_exercise', 'supine_heavy', 'contact_sport',
      'high_impact_jump', 'hot_yoga', 'breath_holding'
    ],
    warning_exercises: ['abdominal_exercise', 'heavy_lower_body'],
    safe_alternatives: {
      'supine_heavy': 'incline_position_exercise',
      'high_impact_jump': 'low_impact_stepping',
      'prone_exercise': 'side_lying_exercise',
    },
  },
]

export function getForbiddenExercises(restrictions: string[]): string[] {
  const forbidden = new Set<string>()
  for (const restriction of restrictions) {
    const rule = SAFETY_RULES.find(r => r.restriction === restriction)
    if (rule) {
      rule.forbidden_exercises.forEach(e => forbidden.add(e))
    }
  }
  return Array.from(forbidden)
}

export function getWarningExercises(restrictions: string[]): string[] {
  const warnings = new Set<string>()
  for (const restriction of restrictions) {
    const rule = SAFETY_RULES.find(r => r.restriction === restriction)
    if (rule) {
      rule.warning_exercises.forEach(e => warnings.add(e))
    }
  }
  return Array.from(warnings)
}

export function getSafeAlternative(exerciseId: string, restrictions: string[]): string | null {
  for (const restriction of restrictions) {
    const rule = SAFETY_RULES.find(r => r.restriction === restriction)
    if (rule?.safe_alternatives[exerciseId]) {
      return rule.safe_alternatives[exerciseId]
    }
  }
  return null
}

export function buildSafetyPromptSection(restrictions: string[], forbidden: string[]): string {
  if (restrictions.length === 0 && forbidden.length === 0) return ''

  const allForbidden = [...getForbiddenExercises(restrictions), ...forbidden]
  const warnings = getWarningExercises(restrictions)

  return `
SAFETY CONSTRAINTS (CRITICAL - MUST FOLLOW):
Injury/restriction areas: ${restrictions.join(', ') || 'none'}
FORBIDDEN exercises (never include): ${allForbidden.join(', ') || 'none'}
WARNING exercises (only include with modifications): ${warnings.join(', ') || 'none'}
For each forbidden exercise, substitute with a safe alternative that trains the same muscle group.
Always add a safety_note field when an exercise is near a restriction area.
`
}
