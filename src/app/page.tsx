'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Brain, Shield, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // If already in standalone mode — redirect to app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      router.replace('/app/home')
    }
  }, [router])

  const features = [
    { icon: Brain, text: 'AI составляет твою программу за 30 секунд' },
    { icon: Shield, text: 'Учитывает травмы и ограничения здоровья' },
    { icon: Zap, text: 'Адаптирует нагрузку каждую неделю' },
  ]

  return (
    <div className="flex flex-col min-h-dvh bg-bg px-5 pb-10">
      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center items-center text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
              <span className="font-display font-bold text-2xl text-bg">F</span>
            </div>
            <h1 className="font-display font-bold text-5xl text-text tracking-tight">
              FORMIQ
            </h1>
            <p className="text-muted mt-2 text-base">Your body. Your AI. Your form.</p>
          </div>

          {/* Value prop */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-text leading-tight mb-3">
              AI-тренер, который знает{' '}
              <span className="text-accent">твоё тело</span>
            </h2>
            <p className="text-muted text-base max-w-sm mx-auto leading-relaxed">
              Персональные тренировки, которые адаптируются под тебя каждую неделю. Без зала. Без опыта. Просто начни.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-10 text-left max-w-xs mx-auto">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-accent" />
                </div>
                <span className="text-sm text-text/80">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <Link
          href="/auth/signup"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-accent text-bg font-bold text-base active:scale-95 transition-transform"
        >
          Начать бесплатно
          <ChevronRight size={18} />
        </Link>
        <Link
          href="/auth/login"
          className="flex items-center justify-center w-full py-4 rounded-xl bg-surface2 text-text font-medium text-base active:scale-95 transition-transform"
        >
          Уже есть аккаунт
        </Link>
        <p className="text-center text-xs text-muted">
          7 дней бесплатно · Отмена в любое время
        </p>
      </motion.div>
    </div>
  )
}
