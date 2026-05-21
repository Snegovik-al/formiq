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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-accent' : 'text-muted'
              )}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
