'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, ChevronRight, Crown, User, Bell, Shield, CreditCard, Sparkles } from 'lucide-react'
import { signOut } from '@/lib/auth/client'

interface ProfileData {
  name: string; email: string; plan: string; trialEnd: string|null
}

const PLAN_LABELS: Record<string,string> = {
  trial:'Пробный период', monthly:'Pro · Ежемесячно', yearly:'Pro · Ежегодно', none:'Без подписки',
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData|null>(null)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(({user})=>{
      if(!user) return
      setProfile({ name:user.name??'Пользователь', email:user.email??'', plan:user.subscription?.planId??'none', trialEnd:user.subscription?.trialEnd??null })
    })
  },[])

  async function logout() { await signOut(); router.replace('/') }

  const trialDays = profile?.trialEnd ? Math.max(0,Math.ceil((new Date(profile.trialEnd).getTime()-Date.now())/86400000)) : 0
  const isPro = profile?.plan==='monthly'||profile?.plan==='yearly'

  return (
    <div style={{padding:'56px 20px 120px',display:'flex',flexDirection:'column',gap:14}}>

      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:400,color:'#41464B',lineHeight:1.05,marginBottom:4}}>
        Профиль
      </h1>

      {/* ── hero card ──────────────────────────────────── */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <div style={{
          borderRadius:24,padding:'24px 22px',
          background:'linear-gradient(145deg,rgba(65,70,75,0.92) 0%,rgba(50,55,60,0.96) 100%)',
          border:'0.5px solid rgba(255,255,255,0.07)',
          position:'relative',overflow:'hidden',
        }}>
          {/* sage glow */}
          <div style={{position:'absolute',top:'-40%',right:'-20%',width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(123,143,122,0.20) 0%,transparent 70%)',pointerEvents:'none'}}/>

          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16,position:'relative'}}>
            {/* avatar */}
            <div style={{width:56,height:56,borderRadius:18,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'0.5px solid rgba(255,255,255,0.18)'}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:'#fff'}}>
                {profile?.name[0]?.toUpperCase()??'?'}
              </span>
            </div>
            <div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:'#fff',lineHeight:1.1}}>
                {profile?.name??'...'}
              </p>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.45)',fontWeight:300,marginTop:2}}>{profile?.email}</p>
            </div>
          </div>

          {/* plan badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.10)',borderRadius:20,padding:'5px 12px',marginBottom:16,position:'relative'}}>
            <Crown size={11} color={isPro?'#C9A84C':'rgba(255,255,255,0.5)'}/>
            <span style={{fontSize:11,fontWeight:500,color:isPro?'#C9A84C':'rgba(255,255,255,0.6)',letterSpacing:'0.02em'}}>
              {PLAN_LABELS[profile?.plan??'none']}
            </span>
          </div>

          {/* trial notice */}
          {profile?.plan==='trial' && trialDays>0 && (
            <div style={{background:'rgba(201,168,76,0.14)',border:'0.5px solid rgba(201,168,76,0.35)',borderRadius:12,padding:'10px 14px',marginBottom:16,position:'relative'}}>
              <p style={{fontSize:12,color:'#C9A84C',fontWeight:300,lineHeight:1.5}}>
                Пробный период истекает через{' '}
                <span style={{fontWeight:500}}>{trialDays} {trialDays===1?'день':trialDays<5?'дня':'дней'}</span>
              </p>
            </div>
          )}

          {/* CTA */}
          <button onClick={()=>router.push('/app/subscription')} style={{
            width:'100%',padding:'14px 0',borderRadius:14,border:'none',cursor:'pointer',
            background:'rgba(246,244,239,0.94)',
            color:'#41464B',fontSize:14,fontWeight:500,letterSpacing:'0.01em',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            position:'relative',
          }}
            onTouchStart={e=>e.currentTarget.style.opacity='0.88'}
            onTouchEnd={e=>e.currentTarget.style.opacity='1'}
          >
            <Sparkles size={14} color="#7B8F7A"/>
            {isPro ? 'Управление подпиской' : 'Перейти на Pro'}
          </button>
        </div>
      </motion.div>

      {/* ── menu rows ──────────────────────────────────── */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.07}}>
        <div style={{background:'rgba(246,244,239,0.72)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,overflow:'hidden'}}>
          {[
            {icon:User,   label:'Параметры профиля', onClick:()=>{}},
            {icon:Bell,   label:'Уведомления',        onClick:()=>{}},
            {icon:Shield, label:'Конфиденциальность', onClick:()=>{}},
            {icon:CreditCard,label:'Биллинг',         onClick:()=>router.push('/app/subscription')},
          ].map(({icon:Icon,label,onClick},i,arr)=>(
            <button key={i} onClick={onClick} style={{
              width:'100%',display:'flex',alignItems:'center',gap:14,
              padding:'15px 18px',
              borderBottom: i<arr.length-1 ? '0.5px solid rgba(217,210,195,0.55)' : 'none',
              background:'none',border:'none',cursor:'pointer',
              transition:'background 0.15s',
            }}
              onTouchStart={e=>e.currentTarget.style.background='rgba(217,210,195,0.30)'}
              onTouchEnd={e=>e.currentTarget.style.background='none'}
            >
              <div style={{width:32,height:32,borderRadius:10,background:'rgba(217,210,195,0.45)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={15} color="#41464B"/>
              </div>
              <span style={{flex:1,textAlign:'left',fontSize:14,color:'#41464B',fontWeight:400}}>{label}</span>
              <ChevronRight size={14} color="rgba(65,70,75,0.30)"/>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── logout ─────────────────────────────────────── */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.11}}>
        <button onClick={logout} style={{
          width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          padding:'15px 0',borderRadius:16,cursor:'pointer',
          background:'rgba(176,58,46,0.07)',
          border:'0.5px solid rgba(176,58,46,0.20)',
          color:'#B03A2E',fontSize:14,fontWeight:400,
          transition:'opacity 0.15s',
        }}
          onTouchStart={e=>e.currentTarget.style.opacity='0.75'}
          onTouchEnd={e=>e.currentTarget.style.opacity='1'}
        >
          <LogOut size={15}/>
          Выйти из аккаунта
        </button>
      </motion.div>

      <p style={{textAlign:'center',fontSize:11,color:'rgba(65,70,75,0.35)',paddingTop:4}}>
        FORMIQ · Данные защищены
      </p>
    </div>
  )
}
