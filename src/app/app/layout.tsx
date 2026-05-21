import { BottomNav } from '@/components/layout/BottomNav'
import { InstallBanner } from '@/components/layout/InstallBanner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <BottomNav />
      <InstallBanner />
    </div>
  )
}
