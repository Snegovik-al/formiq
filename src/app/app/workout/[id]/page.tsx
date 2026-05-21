'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, ChevronLeft, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Workout, ExerciseBlock, SetLog, ExerciseLog } from '@/types'
import { RestTimer } from '@/components/workout/RestTimer'
import { SetLogger } from '@/components/workout/SetLogger'
import { cn } from '@/lib/utils'

type Phase = 'warmup' | 'main' | 'cooldown'
const PHASE_LABELS: Record<Phase,string> = { warmup:'Разминка', main:'Основная', cooldown:'Заминка' }

export default function WorkoutPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const startTime = useRef(Date.now())

  const [workout, setWorkout] = useState<Workout|null>(null)
  const [phase, setPhase] = useState<Phase>('warmup')
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [showRest, setShowRest] = useState(false)
  const [showCues, setShowCues] = useState(false)
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [completing, setCompleting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/workouts/${id}`).then(r=>r.json()).then(j=>{ if(j.workout) setWorkout(j.workout) })
  }, [id])

  const currentExercises: ExerciseBlock[] = workout?.content[phase]?.exercises ?? []
  const currentExercise = currentExercises[exerciseIdx]
  const totalEx = workout ? (workout.content.warmup?.exercises?.length??0)+(workout.content.main?.exercises?.length??0) : 0
  const globalIdx = phase==='warmup' ? exerciseIdx : phase==='main' ? (workout?.content.warmup?.exercises?.length??0)+exerciseIdx : totalEx
  const progress = totalEx>0 ? (globalIdx/totalEx)*100 : 0

  function logSet(setData: Omit<SetLog,'set'>) {
    const entry: SetLog = { set:currentSet, ...setData }
    setLogs(prev => {
      const idx = prev.findIndex(l=>l.exercise_id===currentExercise.exercise_id)
      if (idx>=0) { const u=[...prev]; u[idx]={...u[idx],sets_data:[...u[idx].sets_data,entry]}; return u }
      return [...prev,{exercise_id:currentExercise.exercise_id,exercise_name:currentExercise.name,sets_data:[entry]}]
    })
  }

  function handleSetComplete(weight:number, reps:number) {
    logSet({reps,weight,completed:true})
    if (currentSet<currentExercise.sets) { setCurrentSet(s=>s+1); setShowRest(true) }
    else goNext()
  }

  function goNext() {
    setCurrentSet(1); setShowRest(false); setShowCues(false)
    const next = exerciseIdx+1
    if (next<currentExercises.length) { setExerciseIdx(next) }
    else if (phase==='warmup') { setPhase('main'); setExerciseIdx(0) }
    else if (phase==='main') {
      if ((workout?.content.cooldown?.exercises?.length??0)>0) { setPhase('cooldown'); setExerciseIdx(0) }
      else completeWorkout()
    } else completeWorkout()
  }

  function goPrev() {
    if (exerciseIdx>0) { setExerciseIdx(i=>i-1); setCurrentSet(1) }
    else if (phase==='main') { setPhase('warmup'); setExerciseIdx((workout?.content.warmup?.exercises?.length??1)-1) }
  }

  async function completeWorkout() {
    setCompleting(true)
    const duration = Math.round((Date.now()-startTime.current)/60000)
    await fetch(`/api/workouts/${id}/complete`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({exercises_data:logs,duration_min:duration,perceived_effort:7}) })
    setCompleting(false); setDone(true)
  }

  if (!workout) return <WorkoutSkeleton/>
  if (done) return <WorkoutComplete workout={workout} onHome={()=>router.replace('/app/home')}/>

  return (
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',background:'linear-gradient(160deg,#F6F4EF 0%,#EDE8DF 45%,#D9D2C3 100%)'}}>

      {/* ── top bar ─────────────────────────────────────── */}
      <div style={{padding:'56px 20px 16px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={()=>router.back()} style={{
          width:38,height:38,borderRadius:12,border:'none',cursor:'pointer',
          background:'rgba(246,244,239,0.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
          border:'0.5px solid rgba(217,210,195,0.85)',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
        }}>
          <ArrowLeft size={18} color="#41464B"/>
        </button>

        <div style={{flex:1}}>
          {/* progress bar */}
          <div style={{height:3,borderRadius:2,background:'rgba(217,210,195,0.6)',marginBottom:6,overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:2,background:'#7B8F7A',width:`${progress}%`,transition:'width 0.4s ease'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,color:'#7B8887',fontWeight:300,maxWidth:'70%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{workout.title}</span>
            <span style={{fontSize:12,color:'#7B8887',fontWeight:400}}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* ── phase tabs ───────────────────────────────────── */}
      <div style={{display:'flex',gap:6,padding:'0 20px',marginBottom:16,flexShrink:0}}>
        {(['warmup','main','cooldown'] as Phase[]).map(p=>(
          <div key={p} style={{
            flex:1,height:3,borderRadius:2,
            background: p===phase ? '#7B8F7A' : (p<phase ? 'rgba(123,143,122,0.35)' : 'rgba(217,210,195,0.6)'),
            transition:'background 0.3s',
          }}/>
        ))}
      </div>

      {/* ── rest timer overlay ───────────────────────────── */}
      <AnimatePresence>
        {showRest && (
          <RestTimer seconds={currentExercise.rest_sec} onDone={()=>setShowRest(false)} nextInfo={`Сет ${currentSet} из ${currentExercise.sets} · ${currentExercise.name}`}/>
        )}
      </AnimatePresence>

      {/* ── exercise content ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${exerciseIdx}`}
          initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}
          transition={{duration:0.18}}
          style={{flex:1,padding:'0 20px 24px',display:'flex',flexDirection:'column',gap:12}}
        >
          {/* exercise card */}
          <div style={{
            background:'rgba(246,244,239,0.75)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
            border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:20,padding:'18px 18px 16px',
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.08em',color:'#7B8887',textTransform:'uppercase'}}>
                {PHASE_LABELS[phase]}
              </span>
              <span style={{fontSize:11,color:'#7B8887',fontWeight:300}}>{exerciseIdx+1} / {currentExercises.length}</span>
            </div>

            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:400,color:'#41464B',lineHeight:1.15,marginBottom:12}}>
              {currentExercise?.name}
            </h2>

            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom: currentExercise?.why_this_exercise ? 12 : 0}}>
              {currentExercise?.reps && (
                <Tag>{currentExercise.sets}×{currentExercise.reps}</Tag>
              )}
              <Tag muted>Отдых: {currentExercise?.rest_sec}с</Tag>
              {currentExercise?.weight_note && <Tag muted>{currentExercise.weight_note}</Tag>}
            </div>

            {currentExercise?.why_this_exercise && (
              <p style={{fontSize:12,color:'rgba(65,70,75,0.55)',lineHeight:1.55,fontWeight:300,borderLeft:'1.5px solid rgba(123,143,122,0.35)',paddingLeft:10,margin:0}}>
                {currentExercise.why_this_exercise}
              </p>
            )}
          </div>

          {/* safety warning */}
          {currentExercise?.safety_note && (
            <div style={{display:'flex',gap:10,alignItems:'flex-start',background:'rgba(201,168,76,0.08)',border:'0.5px solid rgba(201,168,76,0.30)',borderRadius:14,padding:'12px 14px'}}>
              <AlertTriangle size={14} color="#8B6914" style={{flexShrink:0,marginTop:1}}/>
              <p style={{fontSize:12,color:'#8B6914',lineHeight:1.5,fontWeight:300,margin:0}}>{currentExercise.safety_note}</p>
            </div>
          )}

          {/* set logger */}
          {phase!=='cooldown' && currentExercise?.sets && (
            <SetLogger exercise={currentExercise} currentSet={currentSet} onSetComplete={handleSetComplete}/>
          )}

          {/* cues */}
          {currentExercise?.execution_cues?.length>0 && (
            <div>
              <button onClick={()=>setShowCues(!showCues)} style={{
                display:'flex',alignItems:'center',gap:6,
                background:'none',border:'none',cursor:'pointer',
                fontSize:13,color:'#7B8F7A',fontWeight:500,padding:'4px 0',
              }}>
                <Lightbulb size={14}/>
                {showCues ? 'Скрыть подсказки' : 'Показать подсказки'}
              </button>
              {showCues && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} style={{overflow:'hidden'}}>
                  <div style={{background:'rgba(246,244,239,0.7)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:'0.5px solid rgba(217,210,195,0.85)',borderRadius:14,padding:'12px 14px',marginTop:8,display:'flex',flexDirection:'column',gap:8}}>
                    {currentExercise.execution_cues.map((cue,i)=>(
                      <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                        <span style={{fontSize:11,fontWeight:600,color:'#7B8F7A',marginTop:1,flexShrink:0}}>{i+1}.</span>
                        <p style={{fontSize:12,color:'rgba(65,70,75,0.75)',lineHeight:1.5,fontWeight:300,margin:0}}>{cue}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── bottom nav ───────────────────────────────────── */}
      <div style={{
        padding:'12px 20px',paddingBottom:'max(env(safe-area-inset-bottom),20px)',
        background:'rgba(246,244,239,0.92)',backdropFilter:'blur(22px)',WebkitBackdropFilter:'blur(22px)',
        borderTop:'0.5px solid rgba(217,210,195,0.85)',
        display:'flex',gap:10,flexShrink:0,
      }}>
        <button onClick={goPrev} style={{
          width:48,height:48,borderRadius:14,border:'0.5px solid rgba(217,210,195,0.85)',
          background:'rgba(246,244,239,0.8)',cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
        }}>
          <ChevronLeft size={20} color="#41464B"/>
        </button>

        {phase==='cooldown' && exerciseIdx===currentExercises.length-1 ? (
          <button onClick={completeWorkout} disabled={completing} style={{
            flex:1,height:48,borderRadius:14,border:'none',cursor:'pointer',
            background:'#7B8F7A',color:'#fff',fontSize:14,fontWeight:500,
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            opacity:completing ? 0.6 : 1,
          }}>
            <CheckCircle2 size={16}/>
            {completing ? 'Сохраняем...' : 'Завершить тренировку'}
          </button>
        ) : (
          <button onClick={goNext} style={{
            flex:1,height:48,borderRadius:14,border:'0.5px solid rgba(217,210,195,0.85)',
            background:'rgba(246,244,239,0.8)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
            color:'#41464B',fontSize:14,fontWeight:400,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          }}>
            Пропустить
            <ChevronRight size={16} color="#7B8887"/>
          </button>
        )}
      </div>
    </div>
  )
}

/* ── helpers ─────────────────────────────────────────────── */
function Tag({children,muted}:{children:React.ReactNode;muted?:boolean}) {
  return (
    <span style={{
      fontSize:11,fontWeight:muted?300:500,
      color:muted?'#7B8887':'#5C7A5B',
      background:muted?'rgba(217,210,195,0.40)':'rgba(123,143,122,0.13)',
      border:`0.5px solid ${muted?'rgba(217,210,195,0.7)':'rgba(123,143,122,0.25)'}`,
      borderRadius:8,padding:'4px 10px',
    }}>
      {children}
    </span>
  )
}

function WorkoutComplete({workout,onHome}:{workout:Workout;onHome:()=>void}) {
  return (
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 28px',background:'linear-gradient(160deg,#F6F4EF 0%,#EDE8DF 45%,#D9D2C3 100%)',textAlign:'center'}}>
      <motion.div initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:260,damping:20}}>
        <div style={{width:80,height:80,borderRadius:24,background:'#7B8F7A',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',boxShadow:'0 8px 24px rgba(123,143,122,0.35)'}}>
          <CheckCircle2 size={40} color="#fff"/>
        </div>
      </motion.div>
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:400,color:'#41464B',marginBottom:6}}>Тренировка завершена!</h1>
        <p style={{fontSize:14,color:'#7B8887',fontWeight:300,marginBottom:32}}>{workout.title}</p>
        <button onClick={onHome} style={{
          width:'100%',padding:'16px 0',borderRadius:16,border:'none',cursor:'pointer',
          background:'#41464B',color:'#F6F4EF',fontSize:15,fontWeight:500,
          boxShadow:'0 4px 16px rgba(65,70,75,0.22)',
        }}>
          На главную
        </button>
      </motion.div>
    </div>
  )
}

function WorkoutSkeleton() {
  return (
    <div style={{padding:'56px 20px 24px',display:'flex',flexDirection:'column',gap:14}}>
      <div className="skeleton" style={{height:4,borderRadius:2}}/>
      <div className="skeleton" style={{height:130,borderRadius:20}}/>
      <div className="skeleton" style={{height:120,borderRadius:20}}/>
      <div className="skeleton" style={{height:60,borderRadius:14}}/>
    </div>
  )
}
