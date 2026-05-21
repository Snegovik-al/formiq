'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Flame, Clock, Dumbbell, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/Card'

interface Stats {
  totalWorkouts: number
  totalMinutes: number
  currentStreak: number
  thisWeek: number
  volumeByWeek: { week: string; count: number }[]
  strengthRecords: { exercise_id: string; weight_kg: number; date: string }[]
  aiInsight: string
}

export default function ProgressPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/stats')
      const json = await res.json()
      const logs: { completed_at: string; duration_min: number | null }[] = json.logs ?? []
      const strength = json.strength ?? []
      const dates = logs.map(l => l.completed_at)
      const totalWorkouts = logs.length
      const totalMinutes = logs.reduce((s, l) => s + (l.duration_min ?? 0), 0)
      const currentStreak = calcStreak(dates)
      const thisWeek = getThisWeekCount(dates)
      const volumeByWeek = calcVolumeByWeek(dates)
      const insights = [
        totalWorkouts > 10
          ? `${totalWorkouts} тренировок — это ${Math.round(totalMinutes / 60)}+ часов работы над собой.`
          : 'Регулярность — ключ к результату. Каждая тренировка важна.',
        currentStreak > 3
          ? `Серия ${currentStreak} дней. Не останавливайся.`
          : 'Постарайся тренироваться последовательно — результат придёт.',
      ]
      setStats({ totalWorkouts, totalMinutes, currentStreak, thisWeek, volumeByWeek, strengthRecords: strength,
        aiInsight: insights[Math.floor(Math.random() * insights.length)] })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="px-4 pt-14 pb-28 space-y-3">
      <div className="h-9 w-36 skeleton rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 skeleton rounded-[20px]" />)}
      </div>
      <div className="h-48 skeleton rounded-[20px]" />
    </div>
  )

  const s = stats!

  return (
    <div className="px-4 pt-14 pb-28 space-y-3">
      <h1 className="font-display font-normal text-dark mb-2" style={{ fontSize: 32 }}>Прогресс</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Dumbbell}   value={s.totalWorkouts}                  label="тренировок" />
        <StatCard icon={Clock}      value={Math.round(s.totalMinutes / 60)}  label="часов" />
        <StatCard icon={Flame}      value={s.currentStreak}                  label="дней серия" />
        <StatCard icon={TrendingUp} value={s.thisWeek}                       label="эта неделя" />
      </div>

      <Card>
        <p className="text-[11px] uppercase tracking-[0.05em] text-muted mb-4">Тренировок по неделям</p>
        {s.volumeByWeek.length > 0 ? (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={s.volumeByWeek} barSize={18}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8A9096' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'rgba(246,244,239,0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '0.5px solid rgba(217,210,195,0.85)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#41464B',
                }}
                cursor={{ fill: 'rgba(123,143,122,0.08)', radius: 4 }}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {s.volumeByWeek.map((_, i) => (
                  <Cell key={i} fill={i === s.volumeByWeek.length - 1 ? '#7B8F7A' : '#D9D2C3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[13px] text-muted text-center py-10">Данные появятся после первых тренировок</p>
        )}
      </Card>

      {s.strengthRecords.length > 0 && (
        <Card>
          <p className="text-[11px] uppercase tracking-[0.05em] text-muted mb-3">Рекорды силы</p>
          {s.strengthRecords.slice(0, 5).map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-[11px]"
              style={{ borderBottom: i < Math.min(s.strengthRecords.length, 5) - 1 ? '0.5px solid rgba(217,210,195,0.5)' : 'none' }}
            >
              <span className="text-[13px] text-text capitalize">{r.exercise_id.replace(/_/g, ' ')}</span>
              <span className="text-[13px] font-medium text-accent">{r.weight_kg} кг</span>
            </motion.div>
          ))}
        </Card>
      )}

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/13 flex items-center justify-center shrink-0">
            <Zap size={13} className="text-accent" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.05em] text-muted mb-1">AI Анализ</p>
            <p className="text-[13px] text-text/80 leading-relaxed">{s.aiInsight}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <Card>
      <Icon size={15} className="text-muted mb-2" />
      <p className="font-display font-normal text-dark" style={{ fontSize: 38, lineHeight: 1 }}>{value}</p>
      <p className="text-[11px] text-muted mt-1 uppercase tracking-[0.04em]">{label}</p>
    </Card>
  )
}

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0
  let streak = 0
  let current = new Date()
  current.setHours(0, 0, 0, 0)
  const sorted = [...new Set(dates.map(d => new Date(d).toDateString()))].sort().reverse()
  for (const dateStr of sorted) {
    const date = new Date(dateStr)
    const diff = Math.floor((current.getTime() - date.getTime()) / 86400000)
    if (diff <= 1) { streak++; current = date }
    else break
  }
  return streak
}

function getThisWeekCount(dates: string[]): number {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() + 1)
  start.setHours(0, 0, 0, 0)
  return dates.filter(d => new Date(d) >= start).length
}

function calcVolumeByWeek(dates: string[]): { week: string; count: number }[] {
  const weeks: Record<string, number> = {}
  for (const d of dates) {
    const date = new Date(d)
    const mon = new Date(date)
    mon.setDate(date.getDate() - date.getDay() + 1)
    const key = mon.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
    weeks[key] = (weeks[key] ?? 0) + 1
  }
  return Object.entries(weeks).slice(-6).map(([week, count]) => ({ week, count }))
}
