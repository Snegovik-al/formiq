'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, ChevronRight, Zap, Trophy, Dumbbell, Play } from 'lucide-react'
import { Workout } from '@/types'
import { getGreeting, getDayOfWeek } from '@/lib/utils'

/* ── helpers ────────────────────────────────────────────── */
function calcStreak(dates: string[]): number {
  if (!dates.length) return 0
  let streak = 0
  let cur = new Date(); cur.setHours(0,0,0,0)
  const sorted = [...new Set(dates.map(d => new Date(d).toDateString()))].sort().reverse()
  for (const s of sorted) {
    const d = new Date(s)
    if (Math.floor((cur.getTime()-d.getTime())/86400000) <= 1) { streak++; cur=d } else break
  }
  return streak
}
function getThisWeek(dates: string[]): number {
  const now = new Date(), start = new Date(now)
  start.setDate(now.getDate()-now.getDay()+1); start.setHours(0,0,0,0)
  return dates.filter(d => new Date(d) >= start).length
}

/* ── page ───────────────────────────────────────────────── */
export default function HomePage() {
  const [data, setData] = useState<{
    workout: Workout|null; upcoming: Workout|null
    streak: number; week: number; target: number
    insight: string; name: string
  }|null>(null)

  useEffect(() => {
    Promise.all([fetch('/api/workouts/today'),fetch('/api/stats'),fetch('/api/auth/me')])
      .then(rs => Promise.all(rs.map(r=>r.json())))
      .then(([today,stats,me]) => {
        const logs: string[] = (stats.logs??[]).map((l:{completed_at:string})=>l.completed_at)
        const tips = ['Регулярность важнее интенсивности.','AI отслеживает прогресс и скоро усилит нагрузку.','Хороший сон — лучший прогресс.','Каждая тренировка делает тебя сильнее.']
        setData({ workout:today.workout??null, upcoming:today.upcoming??null, streak:calcStreak(logs), week:getThisWeek(logs), target:stats.workoutsPerWeek??3, insight:tips[Math.floor(Math.random()*tips.length)], name:me.user?.name?.split(' ')[0]??'Атлет' })
      })
  }, [])

  if (!data) return <Skeleton />

  const { workout, upcoming, streak, week, target, insight, name } = data

  return (
    <div className="px-5 pt-16 pb-32 space-y-4">

      {/* greeting */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
        <p style={{fontSize:11,letterSpacing:'0.08em',color:'#7B8887',textTransform:'uppercase',fontWeight:500,marginBottom:4}}>
          {getGreeting()},
        </p>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:400,color:'#41464B',lineHeight:1.05,letterSpacing:'-0.01em'}}>
          {name}
        </h1>
      </motion.div>

      {/* main workout card */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.07}}>
        {workout ? <TodayCard workout={workout}/> : upcoming ? <UpcomingCard workout={upcoming}/> : <RestCard/>}
      </motion.div>

      {/* week strip */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.12}}>
        <div style={{background:'rgba(246,244,239,0.7)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,padding:'16px 18px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <span style={{fontSize:11,fontWeight:500,letterSpacing:'0.07em',color:'#7B8887',textTransform:'uppercase'}}>Эта неделя</span>
            <span style={{fontSize:13,color:'#7B8887',fontWeight:300}}>{week} из {target}</span>
          </div>
          <div style={{display:'flex',gap:6}}>
            {Array.from({length:target}).map((_,i)=>(
              <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<week?'#7B8F7A':'rgba(217,210,195,0.7)',transition:'background 0.3s'}}/>
            ))}
          </div>
        </div>
      </motion.div>

      {/* stats 2-col */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.16}} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <StatCard icon={<Flame size={14} color="#C9A84C"/>} label="Серия" value={streak} unit="дней подряд"/>
        <StatCard icon={<Trophy size={14} color="#7B8F7A"/>} label="Неделя" value={week} unit="тренировок"/>
      </motion.div>

      {/* ai insight */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
        <div style={{background:'rgba(246,244,239,0.7)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,padding:'16px 18px',display:'flex',gap:14,alignItems:'flex-start'}}>
          <div style={{width:34,height:34,borderRadius:17,background:'rgba(123,143,122,0.14)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Zap size={14} color="#7B8F7A"/>
          </div>
          <div>
            <p style={{fontSize:10,fontWeight:500,letterSpacing:'0.08em',color:'#7B8887',textTransform:'uppercase',marginBottom:5}}>AI Инсайт</p>
            <p style={{fontSize:13,color:'rgba(65,70,75,0.78)',lineHeight:1.55,fontWeight:300}}>{insight}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── sub-components ─────────────────────────────────────── */

function TodayCard({workout}:{workout:Workout}) {
  return (
    <div style={{borderRadius:22,overflow:'hidden',position:'relative',padding:'22px 20px 20px'}}>
      {/* dark gradient bg */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(145deg,#3D4147 0%,#2E3136 100%)',zIndex:0}}/>
      {/* sage glow */}
      <div style={{position:'absolute',top:'-30%',right:'-10%',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(123,143,122,0.22) 0%,transparent 70%)',pointerEvents:'none',zIndex:1}}/>

      <div style={{position:'relative',zIndex:2}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
          <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.09em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase'}}>Сегодня</span>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontWeight:300,background:'rgba(255,255,255,0.08)',borderRadius:20,padding:'3px 10px'}}>{workout.estimated_duration} мин</span>
        </div>

        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400,color:'#fff',lineHeight:1.15,marginBottom:8}}>
          {workout.title}
        </h2>

        {workout.ai_note && (
          <p style={{fontSize:12,color:'rgba(255,255,255,0.48)',lineHeight:1.5,marginBottom:18,fontWeight:300,borderLeft:'1.5px solid rgba(255,255,255,0.15)',paddingLeft:12}}>
            {workout.ai_note}
          </p>
        )}

        <Link href={`/app/workout/${workout.id}`}
          style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'rgba(246,244,239,0.94)',borderRadius:14,padding:'15px 20px',color:'#41464B',fontSize:14,fontWeight:500,letterSpacing:'0.01em',textDecoration:'none',transition:'opacity 0.15s'}}>
          <Play size={14} fill="#41464B"/>
          Начать тренировку
          <ChevronRight size={15} color="#7B8887"/>
        </Link>
      </div>
    </div>
  )
}

function UpcomingCard({workout}:{workout:Workout}) {
  return (
    <div style={{background:'rgba(246,244,239,0.7)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,padding:'18px 20px'}}>
      <p style={{fontSize:10,fontWeight:500,letterSpacing:'0.08em',color:'#7B8887',textTransform:'uppercase',marginBottom:8}}>Следующая тренировка</p>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:'#41464B',marginBottom:4}}>{workout.title}</h2>
      <p style={{fontSize:12,color:'#7B8887',fontWeight:300,marginBottom:16}}>{getDayOfWeek(new Date(workout.scheduled_date))} · {workout.estimated_duration} мин</p>
      <div style={{background:'rgba(217,210,195,0.35)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:12,padding:'12px 14px',fontSize:12.5,color:'#7B8887',fontWeight:300,lineHeight:1.5}}>
        Сегодня день отдыха — дай мышцам восстановиться
      </div>
    </div>
  )
}

function RestCard() {
  return (
    <div style={{background:'rgba(246,244,239,0.7)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,padding:'28px 20px',textAlign:'center'}}>
      <div style={{width:48,height:48,borderRadius:24,background:'rgba(123,143,122,0.13)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
        <Trophy size={20} color="#7B8F7A"/>
      </div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,color:'#41464B',marginBottom:6}}>Все тренировки выполнены</h2>
      <p style={{fontSize:13,color:'#7B8887',fontWeight:300}}>Программа следующей недели готова</p>
    </div>
  )
}

function StatCard({icon,label,value,unit}:{icon:React.ReactNode;label:string;value:number;unit:string}) {
  return (
    <div style={{background:'rgba(246,244,239,0.7)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,padding:'16px 18px'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
        {icon}
        <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.07em',color:'#7B8887',textTransform:'uppercase'}}>{label}</span>
      </div>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:400,color:'#41464B',lineHeight:1}}>{value}</p>
      <p style={{fontSize:11,color:'#7B8887',marginTop:4,fontWeight:300}}>{unit}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="px-5 pt-16 pb-32 space-y-4">
      <div className="skeleton h-3 w-24 rounded-full"/>
      <div className="skeleton h-11 w-44 rounded-xl"/>
      <div className="skeleton h-44 rounded-[22px]"/>
      <div className="skeleton h-16 rounded-[20px]"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div className="skeleton h-28 rounded-[20px]"/>
        <div className="skeleton h-28 rounded-[20px]"/>
      </div>
      <div className="skeleton h-20 rounded-[20px]"/>
    </div>
  )
}
