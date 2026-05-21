import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'FORMIQ — AI Fitness Trainer',
  description: 'Your personal AI fitness trainer. Personalized workouts. Adaptive. Smart.',
  applicationName: 'FORMIQ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FORMIQ',
  },
  formatDetection: { telephone: false },
  other: { 'mobile-web-app-capable': 'yes' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F6F4EF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="text-text font-body antialiased min-h-dvh">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
