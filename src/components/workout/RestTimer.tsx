'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SkipForward } from 'lucide-react'

interface Props {
  seconds: number
  onDone: () => void
  nextInfo?: string
}

export function RestTimer({ seconds, onDone, nextInfo }: Props) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(()=>{
    if(remaining<=0){onDone();return}
    const t=setTimeout(()=>setRemaining(r=>r-1),1000)
    return ()=>clearTimeout(t)
  },[remaining,onDone])

  const pct = (remaining/seconds)*100
  const r = 44
  const circ = 2*Math.PI*r

  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{
        position:'fixed',inset:0,zIndex:50,
        background:'rgba(246,244,239,0.96)',
        backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        padding:'0 32px',
      }}
    >
      {/* ring */}
      <div style={{position:'relative',width:176,height:176,marginBottom:28}}>
        <svg width="176" height="176" viewBox="0 0 100 100" style={{transform:'rotate(-90deg)',width:'100%',height:'100%'}}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(217,210,195,0.55)" strokeWidth={5}/>
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#7B8F7A" strokeWidth={5} strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ*(1-pct/100)}
            style={{transition:'stroke-dashoffset 1s linear'}}
          />
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:400,color:'#41464B',lineHeight:1}}>{remaining}</span>
          <span style={{fontSize:11,color:'#7B8887',fontWeight:300,letterSpacing:'0.05em',textTransform:'uppercase',marginTop:2}}>секунд</span>
        </div>
      </div>

      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400,color:'#41464B',marginBottom:8}}>Отдых</h2>
      {nextInfo && (
        <p style={{fontSize:13,color:'#7B8887',textAlign:'center',fontWeight:300,marginBottom:32,lineHeight:1.5}}>
          Следующий: {nextInfo}
        </p>
      )}

      <button onClick={onDone} style={{
        display:'flex',alignItems:'center',gap:8,
        padding:'13px 24px',borderRadius:14,cursor:'pointer',
        background:'rgba(246,244,239,0.8)',
        backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',
        border:'0.5px solid rgba(217,210,195,0.85)',
        color:'#41464B',fontSize:14,fontWeight:400,
      }}>
        <SkipForward size={15}/>
        Пропустить отдых
      </button>
    </motion.div>
  )
}
