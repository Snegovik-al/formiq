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
    <div className="flex flex-col min-h-dvh px-5 pb-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-48 h-48 rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="flex items-center pt-14 pb-8 relative">
        <Link href="/" className="p-2 -ml-2 glass rounded-xl text-muted active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 relative">
        <h1 className="font-display font-black text-3xl text-text mb-1">С возвращением</h1>
        <p className="text-muted mb-8">Войди в свой аккаунт FORMIQ</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass text-text placeholder:text-muted border-0 focus:outline-none focus:ring-2 focus:ring-accent/30 text-base"
              />
            </div>
            {errors.email && <p className="text-xs text-danger mt-1.5 pl-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Пароль"
                autoComplete="current-password"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl glass text-text placeholder:text-muted border-0 focus:outline-none focus:ring-2 focus:ring-accent/30 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger mt-1.5 pl-1">{errors.password.message}</p>}
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/8 border border-danger/15 px-4 py-3 rounded-2xl">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
            Войти
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Нет аккаунта?{' '}
          <Link href="/auth/signup" className="text-accent font-semibold">Зарегистрироваться</Link>
        </p>
      </motion.div>
    </div>
  )
}
