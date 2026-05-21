'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, BarChart2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/app/home',     icon: Home,     label: 'Главная' },
  { href: '/app/workout',  icon: Dumbbell, label: 'Тренировка' },
  { href: '/app/progress', icon: BarChart2, label: 'Прогресс' },
  { href: '/app/profile',  icon: User,     label: 'Профиль' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'rgba(246,244,239,0.92)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderTop: '0.5px solid rgba(217,210,195,0.85)',
      }}
    >
      <div className="flex items-stretch h-[60px] max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-[3px] transition-colors',
                active ? 'text-accent' : 'text-text/38'
              )}
            >
              <tab.icon
                size={22}
                strokeWidth={active ? 2 : 1.7}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
