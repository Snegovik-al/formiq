'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Brain, Shield, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      router.replace('/app/home')
    }
  }, [router])

  const features = [
    { icon: Brain, text: 'AI составляет программу за 30 секунд' },
    { icon: Shield, text: 'Учитывает травмы и ограничения' },
    { icon: Zap, text: 'Адаптирует нагрузку каждую неделю' },
  ]

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 rounded-full bg-accent/8 blur-3xl" />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center items-center text-center pt-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full"
        >
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass mb-6 relative"
          >
            {/* Gold ribbon accent */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold/80 blur-[2px]" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-accent/60 blur-[2px]" />
            <span className="font-display font-black text-3xl text-accent relative z-10">F</span>
          </motion.div>

          <h1 className="font-display font-black text-5xl text-text tracking-tight leading-none mb-1">
            FORMIQ
          </h1>
          <p className="text-muted text-sm mb-10">Your body. Your AI. Your form.</p>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-text leading-tight mb-3">
              AI-тренер, который знает{' '}
              <span className="text-accent">твоё тело</span>
            </h2>
            <p className="text-muted text-base max-w-sm mx-auto leading-relaxed">
              Персональные тренировки, адаптирующиеся под тебя каждую неделю.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2.5 mb-10 max-w-xs mx-auto">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
                className="glass flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-accent" />
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
        transition={{ delay: 0.55 }}
        className="space-y-3 relative"
      >
        <Link
          href="/auth/signup"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-accent text-bg font-bold text-base active:scale-95 transition-transform shadow-accent"
        >
          Начать бесплатно
          <ChevronRight size={18} />
        </Link>
        <Link
          href="/auth/login"
          className="flex items-center justify-center w-full py-4 rounded-2xl glass text-text font-semibold text-base active:scale-95 transition-transform"
        >
          Уже есть аккаунт
        </Link>
        <p className="text-center text-xs text-muted pt-1">
          7 дней бесплатно · Отмена в любое время
        </p>
      </motion.div>
    </div>
  )
}
