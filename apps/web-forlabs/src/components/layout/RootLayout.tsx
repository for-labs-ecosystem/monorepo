import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { NetworkBar } from '@/components/layout/NetworkBar'
import { MainHeader } from '@/components/layout/MainHeader'
import { MegaFooter } from '@/components/layout/MegaFooter'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <NetworkBar />
      <MainHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <MegaFooter />
    </div>
  )
}
