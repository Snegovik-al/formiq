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
    startupImage: [
      { url: '/icons/splash-2048.png', media: '(device-width: 1024px) and (device-height: 1366px)' },
      { url: '/icons/splash-1125.png', media: '(device-width: 375px) and (device-height: 812px)' },
    ],
  },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className="bg-bg text-text font-body antialiased min-h-dvh">
          <ServiceWorkerRegister />
        {children}
</body>
    </html>
  )
}
