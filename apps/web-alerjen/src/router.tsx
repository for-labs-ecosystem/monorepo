import { lazy, Suspense } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const ArticlesPage = lazy(() => import('@/pages/ArticlesPage'))
const ArticleDetailPage = lazy(() => import('@/pages/ArticleDetailPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const DynamicPage = lazy(() => import('@/pages/DynamicPage'))

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
                path: 'arastirmalar',
                element: <SuspenseWrapper><ArticlesPage /></SuspenseWrapper>,
            },
            {
                path: 'arastirmalar/:slug',
                element: <SuspenseWrapper><ArticleDetailPage /></SuspenseWrapper>,
            },
            {
                path: 'kurumsal',
                element: <SuspenseWrapper><AboutPage /></SuspenseWrapper>,
            },
            {
                path: 'iletisim',
                element: <SuspenseWrapper><ContactPage /></SuspenseWrapper>,
            },
            // CMS dynamic page catch-all — MUST be last
            {
                path: ':slug',
                element: <SuspenseWrapper><DynamicPage /></SuspenseWrapper>,
            },
        ],
    },
]

export const router = createBrowserRouter(routes)
