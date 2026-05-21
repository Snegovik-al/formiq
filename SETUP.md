# FORMIQ — Setup Guide

## 1. Supabase

1. Создай проект на [supabase.com](https://supabase.com)
2. Скопируй Project URL и anon key → `.env.local`
3. Запусти SQL из `supabase/migrations/001_initial_schema.sql` в SQL Editor
4. В Authentication → Providers → включи Google OAuth

## 2. Anthropic API

1. [console.anthropic.com](https://console.anthropic.com) → API Keys
2. Вставь в `ANTHROPIC_API_KEY` в `.env.local`

## 3. Stripe

1. Создай аккаунт на [stripe.com](https://stripe.com)
2. Products → создай 2 продукта:
   - Monthly: $12.99/month, recurring
   - Yearly: $79.99/year, recurring
3. Скопируй Price IDs → `.env.local`
4. Webhooks → добавь endpoint `/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

## 4. Запуск

```bash
npm install
npm run dev
# Открой http://localhost:3000
```

## 5. Деплой на Vercel

```bash
npm install -g vercel
vercel
# Добавь все переменные из .env.local в Vercel Dashboard
```

## 6. PWA иконки

Создай иконки и положи в `/public/icons/`:
- `icon-96.png`   — 96×96
- `icon-192.png`  — 192×192
- `icon-512.png`  — 512×512
- `icon-maskable-512.png` — 512×512 с padding 20%

Инструмент: [realfavicongenerator.net](https://realfavicongenerator.net)

## Структура проекта

```
formiq/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── auth/               # Login, Signup
│   │   ├── onboarding/         # 8-step onboarding
│   │   ├── app/                # Main app (protected)
│   │   │   ├── home/           # Dashboard
│   │   │   ├── workout/        # Workout list + player
│   │   │   ├── progress/       # Progress & stats
│   │   │   ├── profile/        # Profile & subscription
│   │   │   └── subscription/   # Paywall
│   │   └── api/                # API routes
│   ├── components/             # UI components
│   ├── lib/
│   │   ├── ai/                 # Claude API + prompts + safety
│   │   ├── supabase/           # DB client
│   │   └── db/                 # Exercise library
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript types
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   └── offline.html            # Offline fallback
└── supabase/
    └── migrations/             # SQL schema
```
