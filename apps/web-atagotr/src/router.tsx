import { lazy, Suspense } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'))
const KnowledgeBankPage = lazy(() => import('@/pages/KnowledgeBankPage'))
const KnowledgeArticleDetailPage = lazy(() => import('@/pages/KnowledgeArticleDetailPage'))
const HakkimizdaPage = lazy(() => import('@/pages/HakkimizdaPage'))
const HelpSupportPage = lazy(() => import('@/pages/HelpSupportPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'))
const KvkkPage = lazy(() => import('@/pages/KvkkPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            {children}
        </Suspense>
    )
}

const routes: RouteObject[] = [
    {
        element: <Layout />,
        children: [
            {
                index: true,
                element: <SuspenseWrapper><HomePage /></SuspenseWrapper>,
            },
            {
                path: 'urunler',
                element: <SuspenseWrapper><ProductsPage /></SuspenseWrapper>,
            },
            {
                path: 'urunler/:slug',
                element: <SuspenseWrapper><ProductDetailPage /></SuspenseWrapper>,
            },
            {
                path: 'hizmetler',
                element: <SuspenseWrapper><ServicesPage /></SuspenseWrapper>,
            },
            {
                path: 'hizmetler/:slug',
                element: <SuspenseWrapper><ServiceDetailPage /></SuspenseWrapper>,
            },
            {
                path: 'bilgi-bankasi',
                element: <SuspenseWrapper><KnowledgeBankPage /></SuspenseWrapper>,
            },
            {
                path: 'bilgi-bankasi/:slug',
                element: <SuspenseWrapper><KnowledgeArticleDetailPage /></SuspenseWrapper>,
            },
            {
                path: 'hakkimizda',
                element: <SuspenseWrapper><HakkimizdaPage /></SuspenseWrapper>,
            },
            {
                path: 'destek',
                element: <SuspenseWrapper><HelpSupportPage /></SuspenseWrapper>,
            },
            {
                path: 'sepet',
                element: <SuspenseWrapper><CartPage /></SuspenseWrapper>,
            },
            {
                path: 'odeme',
                element: <SuspenseWrapper><CheckoutPage /></SuspenseWrapper>,
            },
            {
                path: 'giris',
                element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
            },
            {
                path: 'kayit',
                element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper>,
            },
            {
                path: 'hesabim',
                element: <SuspenseWrapper><AccountPage /></SuspenseWrapper>,
            },
            {
                path: 'siparis-basarili',
                element: <SuspenseWrapper><OrderSuccessPage /></SuspenseWrapper>,
            },
            {
                path: 'kvkk',
                element: <SuspenseWrapper><KvkkPage /></SuspenseWrapper>,
            },
            {
                path: 'kullanim-kosullari',
                element: <SuspenseWrapper><TermsPage /></SuspenseWrapper>,
            },
            {
                path: 'gizlilik-politikasi',
                element: <SuspenseWrapper><PrivacyPage /></SuspenseWrapper>,
            },
            {
                path: 'auth/callback',
                element: <SuspenseWrapper><AuthCallbackPage /></SuspenseWrapper>,
            },
        ],
    },
]

export const router = createBrowserRouter(routes)
