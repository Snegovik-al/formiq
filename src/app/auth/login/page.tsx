'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
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
        <Link href="/" className="text-[14px] text-accent font-light">← Назад</Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <h1 className="font-display font-normal text-dark mb-1" style={{ fontSize: 34, lineHeight: 1.1 }}>
          Войти
        </h1>
        <p className="text-[13px] text-muted mb-8">Рады видеть тебя снова!</p>

        <div className="glass rounded-[20px] p-[18px] flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.06em] text-muted">Email</span>
            <input
              {...register('email')}
              type="email"
              placeholder="anna@mail.ru"
              autoComplete="email"
              className="glass rounded-2xl px-4 py-3.5 text-[15px] text-text placeholder:text-subtle outline-none focus:border-accent/40 w-full"
            />
            {errors.email && <p className="text-[12px] text-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.06em] text-muted">Пароль</span>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="glass rounded-2xl px-4 py-3.5 pr-12 text-[15px] text-text placeholder:text-subtle outline-none focus:border-accent/40 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-[12px] text-danger">{errors.password.message}</p>}
          </div>

          {error && (
            <p className="text-[12px] text-danger bg-danger/8 border border-danger/15 px-3 py-2.5 rounded-xl text-center">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Войти
          </Button>
          <Button type="button" variant="outline" fullWidth size="lg" onClick={() => router.push('/auth/signup')}>
            Нет аккаунта? Создать
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
