'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { StepDots } from '@/components/ui/ProgressBar'

import StepProfile from '@/components/onboarding/StepProfile'
import StepBody from '@/components/onboarding/StepBody'
import StepGoal from '@/components/onboarding/StepGoal'
import StepLevel from '@/components/onboarding/StepLevel'
import StepHealth from '@/components/onboarding/StepHealth'
import StepSchedule from '@/components/onboarding/StepSchedule'
import StepEquipment from '@/components/onboarding/StepEquipment'
import StepReady from '@/components/onboarding/StepReady'

const STEPS = [
  StepProfile,
  StepBody,
  StepGoal,
  StepLevel,
  StepHealth,
  StepSchedule,
  StepEquipment,
  StepReady,
]

export default function OnboardingPage() {
  const { step, totalSteps, prevStep, nextStep } = useOnboardingStore()
  const router = useRouter()
  const StepComponent = STEPS[step]

  function handleBack() {
    if (step === 0) router.back()
    else prevStep()
  }

  return (
    <div className="flex flex-col min-h-dvh relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-56 h-56 rounded-full bg-accent/6 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 relative">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 glass rounded-xl text-muted active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <StepDots total={totalSteps} current={step} />
        <div className="w-10" />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex-1 px-5 pb-10 relative"
        >
          <StepComponent onNext={nextStep} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
