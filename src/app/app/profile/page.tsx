'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, ChevronRight, Crown, User, Bell, Shield, CreditCard } from 'lucide-react'
import { signOut } from '@/lib/auth/client'
import { Card } from '@/components/ui/Card'

interface ProfileData {
  name: string
  email: string
  plan: string
  trialEnd: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/auth/me')
      const { user } = await res.json()
      if (!user) return
      setProfile({
        name: user.name ?? 'Пользователь',
        email: user.email ?? '',
        plan: user.subscription?.planId ?? 'none',
        trialEnd: user.subscription?.trialEnd ?? null,
      })
    }
    load()
  }, [])

  async function logout() {
    await signOut()
    router.replace('/')
  }

  const trialDaysLeft = profile?.trialEnd
    ? Math.max(0, Math.ceil((new Date(profile.trialEnd).getTime() - Date.now()) / 86400000))
    : 0

  const planLabel: Record<string, string> = {
    trial: 'Пробный период', monthly: 'Ежемесячно', yearly: 'Ежегодно', none: 'Нет подписки',
  }

  return (
    <div className="px-4 pt-14 pb-28 space-y-3">
      <h1 className="font-display font-normal text-dark mb-4" style={{ fontSize: 32 }}>Профиль</h1>

      {/* Profile hero */}
      <div
        className="rounded-[24px] p-[26px] text-center"
        style={{ background: 'linear-gradient(135deg, rgba(123,143,122,0.92), rgba(65,70,75,0.95))' }}
      >
        <div className="w-[66px] h-[66px] rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(255,255,255,0.18)' }}>
          <span className="font-display font-normal text-white" style={{ fontSize: 28 }}>
            {profile?.name[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <p className="font-display font-normal text-white" style={{ fontSize: 26 }}>{profile?.name ?? '...'}</p>
        <p className="text-[12px] text-white/60 mt-1">{profile?.email ?? ''}</p>
        <span
          className="inline-block mt-3 px-4 py-1 rounded-full text-[12px] font-medium"
          style={{
            background: profile?.plan === 'trial'
              ? 'rgba(255,200,0,0.25)'
              : profile?.plan === 'monthly' || profile?.plan === 'yearly'
              ? 'rgba(123,143,122,0.25)'
              : 'rgba(255,255,255,0.15)',
            color: profile?.plan === 'trial' ? '#ffd700'
              : profile?.plan === 'monthly' || profile?.plan === 'yearly' ? '#90ee90'
              : 'rgba(255,255,255,0.7)',
          }}
        >
          {planLabel[profile?.plan ?? 'none']}
        </span>
      </div>

      {/* Subscription card */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Crown size={15} className="text-gold" />
          <p className="text-[11px] uppercase tracking-[0.05em] text-muted">Подписка</p>
        </div>
        {profile?.plan === 'trial' && trialDaysLeft > 0 && (
          <div
            className="rounded-[14px] px-3 py-2.5 mb-3 text-[12px]"
            style={{ background: 'rgba(255,200,0,0.10)', border: '0.5px solid rgba(255,200,0,0.30)', color: '#8B6914' }}
          >
            Пробный период истекает через {trialDaysLeft}{' '}
            {trialDaysLeft === 1 ? 'день' : trialDaysLeft < 5 ? 'дня' : 'дней'}
          </div>
        )}
        <button
          onClick={() => router.push('/app/subscription')}
          className="w-full py-4 rounded-2xl text-white text-[15px] font-medium active:scale-95 transition-transform"
          style={{ background: '#41464B' }}
        >
          {profile?.plan === 'trial' ? 'Перейти на Pro' : 'Управление подпиской'}
        </button>
      </Card>

      {/* Menu */}
      <Card className="divide-y divide-border/50 p-0 overflow-hidden">
        {[
          { icon: User,       label: 'Параметры профиля', onClick: () => {} },
          { icon: Bell,       label: 'Уведомления',        onClick: () => {} },
          { icon: Shield,     label: 'Конфиденциальность', onClick: () => {} },
          { icon: CreditCard, label: 'Биллинг',            onClick: () => router.push('/app/subscription') },
        ].map(({ icon: Icon, label, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            className="w-full flex items-center gap-3 px-[18px] py-[14px] text-text active:bg-surface2/50 transition-colors"
          >
            <Icon size={17} className="text-muted" />
            <span className="flex-1 text-left text-[14px]">{label}</span>
            <ChevronRight size={14} className="text-muted" />
          </button>
        ))}
      </Card>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={logout}
        className="w-full flex items-center gap-3 px-[18px] py-4 rounded-[18px] text-danger text-[14px] active:scale-95 transition-transform"
        style={{ background: 'rgba(192,57,43,0.08)', border: '0.5px solid rgba(192,57,43,0.25)' }}
      >
        <LogOut size={17} />
        Выйти из аккаунта
      </motion.button>

      <p className="text-center text-[11px] text-muted pb-2">FORMIQ · Данные защищены</p>
    </div>
  )
}
