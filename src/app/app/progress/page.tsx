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

      const dates = logs.map((l: { completed_at: string }) => l.completed_at)
      const totalWorkouts = logs.length
      const totalMinutes = logs.reduce((s: number, l: { duration_min: number | null }) => s + (l.duration_min ?? 0), 0)
      const currentStreak = calcStreak(dates)
      const thisWeek = getThisWeekCount(dates)
      const volumeByWeek = calcVolumeByWeek(dates)

      const insights = [
        totalWorkouts > 10
          ? `Ты завершил ${totalWorkouts} тренировок. Это ${Math.round(totalMinutes / 60)}+ часов работы над собой!`
          : 'Регулярность — ключ к результату. Каждая тренировка важна.',
        currentStreak > 3
          ? `Серия ${currentStreak} дней! Ты в отличной форме — не останавливайся.`
          : 'Постарайся тренироваться последовательно — результат придёт.',
      ]

      setStats({
        totalWorkouts,
        totalMinutes,
        currentStreak,
        thisWeek,
        volumeByWeek,
        strengthRecords: strength,
        aiInsight: insights[Math.floor(Math.random() * insights.length)],
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="px-4 pt-14 space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
    </div>
  )

  const s = stats!

  return (
    <div className="px-4 pt-14 pb-6 space-y-5">
      <h1 className="font-display font-bold text-2xl text-text">Прогресс</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Dumbbell} color="accent" value={s.totalWorkouts} label="тренировок всего" />
        <StatCard icon={Clock}    color="blue"    value={Math.round(s.totalMinutes / 60)} label="часов тренировок" />
        <StatCard icon={Flame}    color="warning"  value={s.currentStreak} label="дней серия" />
        <StatCard icon={TrendingUp} color="success" value={s.thisWeek} label="на этой неделе" />
      </div>

      <Card>
        <p className="text-sm font-medium text-text/80 mb-4">Тренировок по неделям</p>
        {s.volumeByWeek.length > 0 ? (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={s.volumeByWeek} barSize={20}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1E1E1E', border: 'none', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {s.volumeByWeek.map((_, i) => (
                  <Cell key={i} fill={i === s.volumeByWeek.length - 1 ? '#C8FF00' : '#2A2A2A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted text-center py-8">Данные появятся после первых тренировок</p>
        )}
      </Card>

      {s.strengthRecords.length > 0 && (
        <Card>
          <p className="text-sm font-medium text-text/80 mb-3">Рекорды силы</p>
          <div className="space-y-2">
            {s.strengthRecords.slice(0, 5).map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-text/80 capitalize">{r.exercise_id.replace(/_/g, ' ')}</span>
                <span className="font-mono font-bold text-sm text-accent">{r.weight_kg} кг</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      <Card glow>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
            <Zap size={14} className="text-accent" />
          </div>
          <div>
            <p className="text-xs text-accent font-medium mb-1">AI Анализ</p>
            <p className="text-sm text-text/80 leading-relaxed">{s.aiInsight}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, color, value, label }: {
  icon: React.ElementType; color: string; value: number; label: string
}) {
  const colorMap: Record<string, string> = {
    accent: 'text-accent bg-accent/10',
    blue: 'text-blue-400 bg-blue-400/10',
    warning: 'text-warning bg-warning/10',
    success: 'text-success bg-success/10',
  }
  return (
    <Card>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorMap[color]}`}>
        <Icon size={16} />
      </div>
      <p className="font-mono font-bold text-2xl text-text">{value}</p>
      <p className="text-xs text-muted">{label}</p>
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
