'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, BarChart2, User } from 'lucide-react'

const TABS = [
  { href:'/app/home',     Icon:Home,      label:'Главная'   },
  { href:'/app/workout',  Icon:Dumbbell,  label:'Тренировка'},
  { href:'/app/progress', Icon:BarChart2, label:'Прогресс'  },
  { href:'/app/profile',  Icon:User,      label:'Профиль'   },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position:'fixed',bottom:0,left:0,right:0,zIndex:50,
      background:'rgba(246,244,239,0.94)',
      backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
      borderTop:'0.5px solid rgba(217,210,195,0.85)',
      paddingBottom:'max(env(safe-area-inset-bottom),8px)',
    }}>
      <div style={{display:'flex',alignItems:'stretch',height:60,maxWidth:480,margin:'0 auto'}}>
        {TABS.map(({href,Icon,label})=>{
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              gap:3,textDecoration:'none',
              color: active ? '#41464B' : 'rgba(65,70,75,0.38)',
              transition:'color 0.15s',
            }}>
              {/* pill bg on active */}
              <div style={{
                width:40,height:28,borderRadius:14,
                display:'flex',alignItems:'center',justifyContent:'center',
                background: active ? 'rgba(217,210,195,0.65)' : 'transparent',
                transition:'background 0.2s',
              }}>
                <Icon size={20} strokeWidth={active ? 2 : 1.6}/>
              </div>
              <span style={{fontSize:9.5,fontWeight: active ? 500 : 400, letterSpacing:'0.01em'}}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
