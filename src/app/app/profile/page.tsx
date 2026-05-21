'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, CreditCard, Bell, Shield, LogOut, ChevronRight, Crown } from 'lucide-react'
import { signOut } from '@/lib/auth/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

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
    <div className="px-4 pt-14 pb-28 space-y-4">
      <h1 className="font-display font-black text-2xl text-text">Профиль</h1>

      {/* Avatar card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shrink-0 shadow-accent">
            <span className="font-display font-black text-2xl text-bg">
              {profile?.name[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text truncate">{profile?.name ?? '...'}</p>
            <p className="text-sm text-muted truncate">{profile?.email ?? ''}</p>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card variant={profile?.plan === 'trial' ? 'gold' : 'glass'}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown size={15} className="text-gold" />
            <p className="font-semibold text-text">Подписка</p>
          </div>
          <Badge variant={
            profile?.plan === 'trial' ? 'gold'
            : profile?.plan === 'monthly' || profile?.plan === 'yearly' ? 'success'
            : 'muted'
          }>
            {planLabel[profile?.plan ?? 'none']}
          </Badge>
        </div>

        {profile?.plan === 'trial' && trialDaysLeft > 0 && (
          <div className="glass-gold rounded-2xl px-3 py-2.5 mb-3">
            <p className="text-xs text-gold">
              Пробный период истекает через {trialDaysLeft}{' '}
              {trialDaysLeft === 1 ? 'день' : trialDaysLeft < 5 ? 'дня' : 'дней'}
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/app/subscription')}
          className="w-full py-3.5 rounded-2xl bg-accent text-bg font-bold text-sm active:scale-95 transition-transform shadow-accent"
        >
          {profile?.plan === 'trial' ? 'Перейти на Pro →' : 'Управление подпиской'}
        </button>
      </Card>

      {/* Menu items */}
      <div className="space-y-2">
        <MenuItem icon={User}       label="Параметры профиля"  onClick={() => {}} />
        <MenuItem icon={Bell}       label="Уведомления"         onClick={() => {}} />
        <MenuItem icon={Shield}     label="Конфиденциальность"  onClick={() => {}} />
        <MenuItem icon={CreditCard} label="Биллинг"             onClick={() => router.push('/app/subscription')} />
      </div>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-danger/8 border border-danger/15 text-danger font-semibold text-sm active:scale-95 transition-transform"
      >
        <LogOut size={17} />
        Выйти из аккаунта
      </motion.button>

      <p className="text-center text-xs text-muted pb-2">FORMIQ v1.0 · Данные защищены</p>
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick }: {
  icon: React.ElementType; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl glass text-text active:scale-[0.98] transition-transform"
    >
      <Icon size={17} className="text-muted" />
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      <ChevronRight size={15} className="text-muted" />
    </button>
  )
}
