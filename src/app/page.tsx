'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      router.replace('/app/home')
    }
  }, [router])

  return (
    <div
      className="flex flex-col min-h-dvh relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #F6F4EF 0%, #C8BFB2 55%, #A8998A 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay gradient — darker at bottom for contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(65,70,75,0.0) 0%, rgba(65,70,75,0.05) 40%, rgba(41,46,51,0.7) 70%, rgba(30,35,40,0.92) 100%)',
        }}
      />

      {/* Top logo */}
      <div className="relative z-10 px-6 pt-16">
        <p className="text-[11px] text-white/50 uppercase tracking-[0.1em] mb-1">Персональный ИИ-тренер</p>
        <h1 className="font-display font-normal text-white/90" style={{ fontSize: 52, lineHeight: 1 }}>
          FORM<span style={{ color: 'rgba(200,220,200,0.85)' }}>IQ</span>
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 pb-14 space-y-3"
      >
        {/* Features */}
        <div className="mb-6 space-y-2">
          {[
            'AI составляет программу за 30 секунд',
            'Учитывает травмы и ограничения',
            'Адаптирует нагрузку каждую неделю',
          ].map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent/80 shrink-0" />
              <span className="text-[13px] text-white/70 font-light">{text}</span>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <Link
          href="/auth/signup"
          className="block w-full py-[17px] rounded-2xl text-center text-white text-[15px] font-medium tracking-[0.02em] active:scale-95 transition-transform"
          style={{
            background: 'rgba(255,255,255,0.20)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255,255,255,0.40)',
          }}
        >
          Создать аккаунт
        </Link>
        <Link
          href="/auth/login"
          className="block w-full py-[17px] rounded-2xl text-center text-white/75 text-[15px] font-light tracking-[0.02em] active:scale-95 transition-transform"
          style={{
            background: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255,255,255,0.15)',
          }}
        >
          Войти в аккаунт
        </Link>
        <p className="text-center text-[11px] text-white/35 tracking-[0.03em] pt-1">
          7 дней бесплатно · Отмена в любое время
        </p>
      </motion.div>
    </div>
  )
}
