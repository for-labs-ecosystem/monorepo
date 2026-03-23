import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { EcosystemProvider } from '@forlabs/core'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { LanguageProvider } from '@/lib/i18n'
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'

const API_URL = import.meta.env.VITE_API_URL as string
const SITE_ID = import.meta.env.VITE_SITE_ID as string

export default function App() {
  return (
    <EcosystemProvider apiUrl={API_URL} siteId={SITE_ID}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </EcosystemProvider>
  )
}
