import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { EcosystemProvider, AuthProvider, CartProvider, createQueryClient } from '@forlabs/core'
import { router } from '@/router'

const API_URL = import.meta.env.VITE_API_URL as string
const SITE_ID = import.meta.env.VITE_SITE_ID as string

const queryClient = createQueryClient()

export default function App() {
    return (
        <EcosystemProvider apiUrl={API_URL} siteId={SITE_ID}>
            <AuthProvider>
                <CartProvider>
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router} />
                    </QueryClientProvider>
                </CartProvider>
            </AuthProvider>
        </EcosystemProvider>
    )
}
