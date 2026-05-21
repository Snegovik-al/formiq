'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, ArrowLeft, Shield, Zap, Brain, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'yearly',
    label: 'Ежегодно',
    price: '79.99',
    per: '$6.67/мес',
    badge: 'Популярный · −48%',
    recommended: true,
  },
  {
    id: 'monthly',
    label: 'Ежемесячно',
    price: '12.99',
    per: 'в месяц',
    badge: null,
    recommended: false,
  },
]

const FEATURES = [
  { icon: Brain,   text: 'AI-тренер адаптирует программу каждую неделю' },
  { icon: Shield,  text: 'Учитывает все травмы и ограничения здоровья' },
  { icon: Zap,     text: 'Объясняет каждое упражнение — почему именно оно' },
  { icon: RefreshCw, text: 'Offline-режим — тренировки без интернета' },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<'yearly' | 'monthly'>('yearly')
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col px-5 pb-10">
      {/* Header */}
      <div className="flex items-center pt-14 pb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted">
          <ArrowLeft size={22} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-6"
      >
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <span className="font-display font-bold text-3xl text-bg">F</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-text mb-2">FORMIQ Pro</h1>
          <p className="text-muted">Полный доступ к AI-тренеру</p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {FEATURES.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                <Icon size={14} className="text-accent" />
              </div>
              <p className="text-sm text-text/80 pt-1.5">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* Plan selector */}
        <div className="flex flex-col gap-3">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id as 'yearly' | 'monthly')}
              className={cn(
                'relative flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all active:scale-98 text-left',
                selected === plan.id
                  ? 'border-accent bg-accent-dim'
                  : 'border-transparent bg-surface2'
              )}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 text-xs bg-accent text-bg font-bold px-2 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                selected === plan.id ? 'border-accent bg-accent' : 'border-muted'
              )}>
                {selected === plan.id && <Check size={12} strokeWidth={3} className="text-bg" />}
              </div>
              <div className="flex-1">
                <p className={cn('font-semibold', selected === plan.id ? 'text-accent' : 'text-text')}>
                  {plan.label}
                </p>
                <p className="text-xs text-muted">{plan.per}</p>
              </div>
              <p className="font-mono font-bold text-text">${plan.price}</p>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto space-y-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-accent text-bg font-bold text-base active:scale-95 transition-transform disabled:opacity-60"
          >
            {loading ? 'Переходим к оплате...' : `Начать · $${PLANS.find(p => p.id === selected)?.price}`}
          </button>
          <p className="text-center text-xs text-muted leading-relaxed">
            🔒 Безопасная оплата через Stripe · Отмена в любое время · Автопродление
          </p>
        </div>
      </motion.div>
    </div>
  )
}
