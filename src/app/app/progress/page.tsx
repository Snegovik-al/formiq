'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Flame, Clock, Dumbbell, Zap, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Stats {
  totalWorkouts: number; totalMinutes: number
  currentStreak: number; thisWeek: number
  volumeByWeek: {week:string;count:number}[]
  strengthRecords: {exercise_id:string;weight_kg:number;date:string}[]
  aiInsight: string
}

function calcStreak(dates:string[]) {
  if(!dates.length) return 0; let s=0,cur=new Date(); cur.setHours(0,0,0,0)
  const sorted=[...new Set(dates.map(d=>new Date(d).toDateString()))].sort().reverse()
  for(const ds of sorted){const d=new Date(ds);if(Math.floor((cur.getTime()-d.getTime())/86400000)<=1){s++;cur=d}else break}
  return s
}
function getThisWeek(dates:string[]) {
  const now=new Date(),start=new Date(now); start.setDate(now.getDate()-now.getDay()+1); start.setHours(0,0,0,0)
  return dates.filter(d=>new Date(d)>=start).length
}
function volByWeek(dates:string[]) {
  const wks:Record<string,number>={}
  for(const d of dates){const dt=new Date(d),mon=new Date(dt);mon.setDate(dt.getDate()-dt.getDay()+1);const k=mon.toLocaleDateString('ru',{day:'numeric',month:'short'});wks[k]=(wks[k]??0)+1}
  return Object.entries(wks).slice(-6).map(([week,count])=>({week,count}))
}

export default function ProgressPage() {
  const [stats, setStats] = useState<Stats|null>(null)

  useEffect(()=>{
    fetch('/api/stats').then(r=>r.json()).then(json=>{
      const logs:{completed_at:string;duration_min:number|null}[]=json.logs??[]
      const dates=logs.map(l=>l.completed_at)
      const tips=[
        logs.length>10 ? `${logs.length} тренировок — это ${Math.round(logs.reduce((s,l)=>s+(l.duration_min??0),0)/60)}+ часов.` : 'Регулярность — ключ к результату. Каждая тренировка важна.',
        calcStreak(dates)>3 ? `Серия ${calcStreak(dates)} дней. Не останавливайся.` : 'Тренируйся последовательно — результат придёт.',
      ]
      setStats({totalWorkouts:logs.length,totalMinutes:logs.reduce((s,l)=>s+(l.duration_min??0),0),currentStreak:calcStreak(dates),thisWeek:getThisWeek(dates),volumeByWeek:volByWeek(dates),strengthRecords:json.strength??[],aiInsight:tips[Math.floor(Math.random()*tips.length)]})
    })
  },[])

  return (
    <div className="px-5 pt-16 pb-32 space-y-4">
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:400,color:'#41464B',lineHeight:1.05,marginBottom:8}}>
        Прогресс
      </h1>

      {!stats ? <ProgressSkeleton/> : <ProgressContent s={stats}/>}
    </div>
  )
}

function ProgressContent({s}:{s:Stats}) {
  return (
    <>
      {/* 2×2 stat grid */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <BigStatCard icon={<Dumbbell size={14} color="#7B8F7A"/>} label="Тренировок" value={s.totalWorkouts}/>
        <BigStatCard icon={<Clock size={14} color="#7B8887"/>} label="Часов" value={Math.round(s.totalMinutes/60)}/>
        <BigStatCard icon={<Flame size={14} color="#C9A84C"/>} label="Дней серия" value={s.currentStreak}/>
        <BigStatCard icon={<TrendingUp size={14} color="#7B8F7A"/>} label="Эта неделя" value={s.thisWeek}/>
      </motion.div>

      {/* bar chart */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.08}}>
        <GlassCard>
          <SectionLabel icon={<BarChart2 size={13} color="#7B8887"/>}>Тренировок по неделям</SectionLabel>
          {s.volumeByWeek.length===0 ? (
            <EmptyChart/>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={s.volumeByWeek} barSize={20}>
                <XAxis dataKey="week" tick={{fontSize:10,fill:'#7B8887',fontFamily:'DM Sans'}} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{background:'rgba(246,244,239,0.95)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:10,fontSize:12,color:'#41464B'}}
                  cursor={{fill:'rgba(217,210,195,0.25)'}}
                />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {s.volumeByWeek.map((_,i)=>(
                    <Cell key={i} fill={i===s.volumeByWeek.length-1?'#7B8F7A':'rgba(123,143,122,0.35)'}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </motion.div>

      {/* strength records */}
      {s.strengthRecords.length>0 && (
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.12}}>
          <GlassCard>
            <SectionLabel icon={<TrendingUp size={13} color="#7B8887"/>}>Рекорды силы</SectionLabel>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {s.strengthRecords.slice(0,5).map((r,i)=>(
                <div key={i} style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'11px 0',
                  borderBottom: i<s.strengthRecords.slice(0,5).length-1 ? '0.5px solid rgba(217,210,195,0.55)' : 'none',
                }}>
                  <span style={{fontSize:13,color:'#41464B',fontWeight:300}}>{r.exercise_id.replace(/_/g,' ')}</span>
                  <span style={{fontSize:13,fontWeight:500,color:'#7B8F7A'}}>{r.weight_kg} кг</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ai insight */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.16}}>
        <GlassCard>
          <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
            <div style={{width:34,height:34,borderRadius:17,background:'rgba(123,143,122,0.13)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Zap size={14} color="#7B8F7A"/>
            </div>
            <div>
              <p style={{fontSize:10,fontWeight:500,letterSpacing:'0.08em',color:'#7B8887',textTransform:'uppercase',marginBottom:5}}>AI Анализ</p>
              <p style={{fontSize:13,color:'rgba(65,70,75,0.78)',lineHeight:1.55,fontWeight:300}}>{s.aiInsight}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </>
  )
}

/* ── atoms ──────────────────────────────────────────────── */
function GlassCard({children}:{children:React.ReactNode}) {
  return (
    <div style={{background:'rgba(246,244,239,0.72)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,padding:'16px 18px'}}>
      {children}
    </div>
  )
}

function SectionLabel({icon,children}:{icon:React.ReactNode;children:React.ReactNode}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:14}}>
      {icon}
      <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.07em',color:'#7B8887',textTransform:'uppercase'}}>{children}</span>
    </div>
  )
}

function BigStatCard({icon,label,value}:{icon:React.ReactNode;label:string;value:number}) {
  return (
    <GlassCard>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
        {icon}
        <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.07em',color:'#7B8887',textTransform:'uppercase'}}>{label}</span>
      </div>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:400,color:'#41464B',lineHeight:1}}>{value}</p>
    </GlassCard>
  )
}

function EmptyChart() {
  return (
    <div style={{height:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6}}>
      <BarChart2 size={22} color="rgba(123,143,122,0.3)"/>
      <p style={{fontSize:12,color:'#7B8887',fontWeight:300}}>Данные появятся после первых тренировок</p>
    </div>
  )
}

function ProgressSkeleton() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:110,borderRadius:20}}/>)}
      </div>
      <div className="skeleton" style={{height:180,borderRadius:20}}/>
      <div className="skeleton" style={{height:90,borderRadius:20}}/>
    </div>
  )
}
