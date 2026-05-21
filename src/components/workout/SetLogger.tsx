'use client'

import { useState } from 'react'
import { ExerciseBlock } from '@/types'
import { Check, Plus, Minus } from 'lucide-react'

interface Props {
  exercise: ExerciseBlock
  currentSet: number
  onSetComplete: (weight: number, reps: number) => void
}

export function SetLogger({ exercise, currentSet, onSetComplete }: Props) {
  const defaultReps = parseInt(exercise.reps?.split('-')[0] ?? '10') || 10
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(defaultReps)

  function adj(field: 'weight'|'reps', delta: number) {
    if (field==='weight') setWeight(w => Math.max(0, Math.round((w+delta)*2)/2))
    else setReps(r => Math.max(1, r+delta))
  }

  return (
    <div style={{
      background:'rgba(246,244,239,0.80)',
      backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
      border:'0.5px solid rgba(217,210,195,0.85)',
      borderRadius:20,
      padding:'18px 16px',
    }}>
      {/* Set dots header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
        <span style={{fontSize:13,fontWeight:500,color:'#41464B'}}>Сет {currentSet} из {exercise.sets}</span>
        <div style={{display:'flex',gap:5}}>
          {Array.from({length:exercise.sets}).map((_,i)=>(
            <div key={i} style={{
              width:8,height:8,borderRadius:4,
              background: i<currentSet-1 ? '#7B8F7A' : i===currentSet-1 ? 'rgba(123,143,122,0.5)' : 'rgba(217,210,195,0.8)',
              transition:'background 0.2s',
            }}/>
          ))}
        </div>
      </div>

      {/* Weight + Reps controls */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        <Counter label="Вес (кг)" value={weight} onMinus={()=>adj('weight',-2.5)} onPlus={()=>adj('weight',2.5)} display={weight===0?'—':String(weight)}/>
        <Counter label="Повторения" value={reps} onMinus={()=>adj('reps',-1)} onPlus={()=>adj('reps',1)} display={String(reps)}/>
      </div>

      {/* Complete set button */}
      <button
        onClick={()=>onSetComplete(weight,reps)}
        style={{
          width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          background:'#41464B',color:'#F6F4EF',border:'none',
          borderRadius:14,padding:'15px 20px',
          fontSize:14,fontWeight:500,letterSpacing:'0.01em',
          cursor:'pointer',transition:'transform 0.15s, opacity 0.15s',
        }}
        onTouchStart={e=>(e.currentTarget.style.transform='scale(0.97)')}
        onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
      >
        <Check size={16} strokeWidth={2.5}/>
        Завершить сет
      </button>
    </div>
  )
}

function Counter({label,value,onMinus,onPlus,display}:{label:string;value:number;onMinus:()=>void;onPlus:()=>void;display:string}) {
  return (
    <div>
      <p style={{fontSize:10,fontWeight:500,letterSpacing:'0.07em',color:'#7B8887',textTransform:'uppercase',textAlign:'center',marginBottom:8}}>{label}</p>
      <div style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        background:'rgba(217,210,195,0.30)',
        border:'0.5px solid rgba(217,210,195,0.85)',
        borderRadius:14,padding:'4px',
      }}>
        <button onClick={onMinus} style={{
          width:40,height:40,borderRadius:11,border:'none',cursor:'pointer',
          background:'rgba(246,244,239,0.85)',
          display:'flex',alignItems:'center',justifyContent:'center',
          transition:'transform 0.12s',flexShrink:0,
        }}
          onTouchStart={e=>e.currentTarget.style.transform='scale(0.9)'}
          onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
        >
          <Minus size={15} color="#41464B" strokeWidth={2}/>
        </button>

        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400,color:'#41464B',minWidth:40,textAlign:'center'}}>
          {display}
        </span>

        <button onClick={onPlus} style={{
          width:40,height:40,borderRadius:11,border:'none',cursor:'pointer',
          background:'#7B8F7A',
          display:'flex',alignItems:'center',justifyContent:'center',
          transition:'transform 0.12s',flexShrink:0,
        }}
          onTouchStart={e=>e.currentTarget.style.transform='scale(0.9)'}
          onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
        >
          <Plus size={15} color="#fff" strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  )
}
