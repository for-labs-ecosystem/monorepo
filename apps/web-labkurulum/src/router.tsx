import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import Layout from '@/components/layout/Layout'

function SuspenseWrapper({ children }: { children: ReactNode }) {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            {children}
        </Suspense>
    )
}

const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'))
const ArticlesPage = lazy(() => import('@/pages/ArticlesPage'))
const ArticleDetailPage = lazy(() => import('@/pages/ArticleDetailPage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const ProjectSimulatorPage = lazy(() => import('@/pages/ProjectSimulatorPage'))
const DynamicPage = lazy(() => import('@/pages/DynamicPage'))

const routes: RouteObject[] = [
    {
        element: <Layout />,
        children: [
            { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
            { path: 'urunler', element: <SuspenseWrapper><ProductsPage /></SuspenseWrapper> },
            { path: 'urunler/:slug', element: <SuspenseWrapper><ProductDetailPage /></SuspenseWrapper> },
            { path: 'hizmetler', element: <SuspenseWrapper><ServicesPage /></SuspenseWrapper> },
            { path: 'hizmetler/:slug', element: <SuspenseWrapper><ServiceDetailPage /></SuspenseWrapper> },
            { path: 'bilgi-bankasi', element: <SuspenseWrapper><ArticlesPage /></SuspenseWrapper> },
            { path: 'bilgi-bankasi/:slug', element: <SuspenseWrapper><ArticleDetailPage /></SuspenseWrapper> },
            { path: 'projeler', element: <SuspenseWrapper><ProjectsPage /></SuspenseWrapper> },
            { path: 'projeler/:slug', element: <SuspenseWrapper><ProjectDetailPage /></SuspenseWrapper> },
            { path: 'iletisim', element: <SuspenseWrapper><ContactPage /></SuspenseWrapper> },
            { path: 'projelendir', element: <SuspenseWrapper><ProjectSimulatorPage /></SuspenseWrapper> },
            // CMS dynamic page catch-all — MUST be last
            { path: ':slug', element: <SuspenseWrapper><DynamicPage /></SuspenseWrapper> },
        ],
    },
]

export const router = createBrowserRouter(routes)
