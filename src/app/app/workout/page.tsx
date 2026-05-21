'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Calendar, Clock, CheckCircle2, Dumbbell } from 'lucide-react'
import { Workout } from '@/types'
import { formatDate } from '@/lib/utils'

const DAY_TYPE_LABELS: Record<string, string> = {
  push:'Толчок', pull:'Тяга', legs:'Ноги', upper:'Верх', lower:'Низ',
  full_body:'Full Body', cardio:'Кардио', mobility:'Мобильность', rest:'Отдых', active_recovery:'Восст.',
}

/* Sage accent colors per category instead of emoji */
const DAY_TYPE_BG: Record<string, {bg:string;color:string}> = {
  push:        {bg:'rgba(123,143,122,0.16)',   color:'#5C7A5B'},
  pull:        {bg:'rgba(65,70,75,0.10)',       color:'#41464B'},
  legs:        {bg:'rgba(123,143,122,0.12)',    color:'#5C7A5B'},
  upper:       {bg:'rgba(65,70,75,0.10)',       color:'#41464B'},
  lower:       {bg:'rgba(123,143,122,0.12)',    color:'#5C7A5B'},
  full_body:   {bg:'rgba(201,168,76,0.14)',     color:'#8B6914'},
  cardio:      {bg:'rgba(176,58,46,0.10)',      color:'#8B2418'},
  mobility:    {bg:'rgba(123,143,122,0.12)',    color:'#5C7A5B'},
  rest:        {bg:'rgba(217,210,195,0.5)',     color:'#7B8887'},
}

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/workouts/list').then(r=>r.json()).then(j=>{setWorkouts(j.workouts??[]);setLoading(false)})
  },[])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = workouts.filter(w=>w.scheduled_date>=today&&w.status!=='completed')
  const completed = workouts.filter(w=>w.status==='completed')

  return (
    <div className="px-5 pt-16 pb-32">
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:400,color:'#41464B',lineHeight:1.05,marginBottom:24}}>
        Тренировки
      </h1>

      {loading ? (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:82,borderRadius:18}}/>)}
        </div>
      ) : workouts.length===0 ? (
        <EmptyState/>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {upcoming.length>0 && (
            <section>
              <SectionLabel>Предстоящие</SectionLabel>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {upcoming.map((w,i)=>(
                  <motion.div key={w.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                    <WorkoutRow workout={w} isToday={w.scheduled_date===today}/>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {completed.length>0 && (
            <section>
              <SectionLabel>Завершённые</SectionLabel>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {completed.slice(0,6).map(w=><WorkoutRow key={w.id} workout={w}/>)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function SectionLabel({children}:{children:React.ReactNode}) {
  return (
    <p style={{fontSize:11,fontWeight:500,letterSpacing:'0.07em',color:'#7B8887',textTransform:'uppercase',marginBottom:10}}>
      {children}
    </p>
  )
}

function WorkoutRow({workout,isToday}:{workout:Workout;isToday?:boolean}) {
  const done = workout.status==='completed'
  const dtype = workout.day_type??'full_body'
  const colors = DAY_TYPE_BG[dtype] ?? {bg:'rgba(217,210,195,0.4)',color:'#7B8887'}

  return (
    <Link href={`/app/workout/${workout.id}`} style={{textDecoration:'none'}}>
      <div style={{
        background: isToday
          ? 'linear-gradient(135deg,rgba(65,70,75,0.92) 0%,rgba(50,55,60,0.96) 100%)'
          : done ? 'rgba(246,244,239,0.5)' : 'rgba(246,244,239,0.75)',
        backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
        border: isToday ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(217,210,195,0.85)',
        borderRadius:18,
        padding:'15px 16px',
        display:'flex',alignItems:'center',gap:14,
        transition:'transform 0.15s',
        opacity: done ? 0.7 : 1,
      }}>

        {/* type badge */}
        <div style={{width:44,height:44,borderRadius:12,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
          background: isToday ? 'rgba(255,255,255,0.1)' : colors.bg}}>
          {done
            ? <CheckCircle2 size={18} color={isToday?'rgba(255,255,255,0.6)':colors.color}/>
            : <Dumbbell size={18} color={isToday?'rgba(255,255,255,0.7)':colors.color}/>
          }
        </div>

        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:14,fontWeight:500,color:isToday?'#fff':'#41464B',marginBottom:4,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {workout.title}
          </p>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11.5,color:isToday?'rgba(255,255,255,0.45)':'#7B8887',fontWeight:300}}>
              <Calendar size={10}/>
              {formatDate(workout.scheduled_date)}
            </span>
            <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11.5,color:isToday?'rgba(255,255,255,0.45)':'#7B8887',fontWeight:300}}>
              <Clock size={10}/>
              {workout.estimated_duration} мин
            </span>
            {isToday && <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.05em',color:'rgba(123,143,122,0.9)',background:'rgba(123,143,122,0.2)',borderRadius:10,padding:'2px 8px'}}>СЕГОДНЯ</span>}
          </div>
        </div>

        <ChevronRight size={15} color={isToday?'rgba(255,255,255,0.3)':'rgba(65,70,75,0.3)'}/>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div style={{textAlign:'center',paddingTop:64,paddingBottom:64}}>
      <div style={{width:56,height:56,borderRadius:28,background:'rgba(123,143,122,0.12)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}>
        <Dumbbell size={22} color="#7B8F7A"/>
      </div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:400,color:'#41464B',marginBottom:6}}>Программа готовится</h2>
      <p style={{fontSize:13,color:'#7B8887',fontWeight:300,lineHeight:1.5}}>AI генерирует твой план тренировок...</p>
    </div>
  )
}
