'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    deferredInstallPrompt?: BeforeInstallPromptEvent
  }
}

export function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    const android = /Android/.test(ua)

    setIsIOS(ios)
    setIsAndroid(android)

    if (ios) {
      setTimeout(() => setShow(true), 3000)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      window.deferredInstallPrompt = e as BeforeInstallPromptEvent
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (window.deferredInstallPrompt) {
      await window.deferredInstallPrompt.prompt()
      const { outcome } = await window.deferredInstallPrompt.userChoice
      if (outcome === 'accepted') setShow(false)
    }
    setShow(false)
  }

  function dismiss() {
    setShow(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-50 bg-surface rounded-2xl p-4 shadow-xl border border-border"
      >
        <button onClick={dismiss} className="absolute top-3 right-3 text-muted">
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-lg text-bg">F</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text text-sm">Добавь FORMIQ на экран</p>
            <p className="text-xs text-muted mt-0.5">Работает как обычное приложение</p>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-3 bg-surface2 rounded-xl p-3">
            <p className="text-xs text-muted leading-relaxed">
              Нажми <span className="text-text font-medium">Поделиться</span> →{' '}
              <span className="text-text font-medium">«На экран «Домой»»</span>
            </p>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-bg text-sm font-semibold active:scale-95 transition-transform"
          >
            <Download size={14} />
            Установить
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
