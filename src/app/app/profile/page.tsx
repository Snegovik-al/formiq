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
    <div className="px-4 pt-14 pb-6 space-y-5">
      <h1 className="font-display font-bold text-2xl text-text">Профиль</h1>

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-2xl text-bg">
              {profile?.name[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text truncate">{profile?.name ?? '...'}</p>
            <p className="text-sm text-muted truncate">{profile?.email ?? ''}</p>
          </div>
        </div>
      </Card>

      <Card glow={profile?.plan === 'trial'}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-accent" />
            <p className="font-medium text-text">Подписка</p>
          </div>
          <Badge variant={
            profile?.plan === 'trial' ? 'warning'
            : profile?.plan === 'monthly' || profile?.plan === 'yearly' ? 'success'
            : 'muted'
          }>
            {planLabel[profile?.plan ?? 'none']}
          </Badge>
        </div>

        {profile?.plan === 'trial' && trialDaysLeft > 0 && (
          <div className="bg-warning/10 rounded-xl px-3 py-2 mb-3">
            <p className="text-xs text-warning">
              ⏰ Пробный период истекает через {trialDaysLeft} {trialDaysLeft === 1 ? 'день' : trialDaysLeft < 5 ? 'дня' : 'дней'}
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/app/subscription')}
          className="w-full py-3 rounded-xl bg-accent text-bg font-bold text-sm active:scale-95 transition-transform"
        >
          {profile?.plan === 'trial' ? 'Перейти на Pro →' : 'Управление подпиской'}
        </button>
      </Card>

      <div className="space-y-2">
        <MenuItem icon={User} label="Параметры профиля" onClick={() => {}} />
        <MenuItem icon={Bell} label="Уведомления" onClick={() => {}} />
        <MenuItem icon={Shield} label="Конфиденциальность" onClick={() => {}} />
        <MenuItem icon={CreditCard} label="Биллинг" onClick={() => router.push('/app/subscription')} />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-danger/10 text-danger font-medium text-sm"
      >
        <LogOut size={18} />
        Выйти из аккаунта
      </motion.button>

      <p className="text-center text-xs text-muted">FORMIQ v1.0 · Данные защищены</p>
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-surface text-text active:scale-98 transition-transform"
    >
      <Icon size={18} className="text-muted" />
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      <ChevronRight size={16} className="text-muted" />
    </button>
  )
}
