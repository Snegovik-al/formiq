'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from '@/lib/auth/client'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  email:    z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const result = await signIn(data.email, data.password)
    if (result.error) { setError(result.error); return }
    router.replace('/app/home')
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-10">
      <div className="flex items-center pt-14 pb-8">
        <Link href="/" className="p-2 -ml-2 text-muted">
          <ArrowLeft size={22} />
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <h1 className="font-display font-bold text-3xl text-text mb-1">С возвращением</h1>
        <p className="text-muted mb-8">Войди в свой аккаунт FORMIQ</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface2 text-text placeholder:text-muted border border-transparent focus:border-accent/50 focus:outline-none text-base"
            />
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="Пароль"
              autoComplete="current-password"
              className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-surface2 text-text placeholder:text-muted border border-transparent focus:border-accent/50 focus:outline-none text-base"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-danger bg-danger/10 px-4 py-3 rounded-xl">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
            Войти
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Нет аккаунта?{' '}
          <Link href="/auth/signup" className="text-accent font-medium">Зарегистрироваться</Link>
        </p>
      </motion.div>
    </div>
  )
}
