import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import NetworkBar from './NetworkBar'

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [pathname])
    return null
}

export default function Layout() {
    return (
        <div className="relative flex flex-col min-h-screen bg-oat-100">
            <ScrollToTop />
            {/* Organic noise overlay — fixed, sayfa boyunca */}
            <div className="noise-overlay" aria-hidden="true" />

            <NetworkBar />
            <header className="sticky top-4 z-50 w-full px-6 lg:px-10">
                <Header />
            </header>
            <main className="relative z-10 flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
