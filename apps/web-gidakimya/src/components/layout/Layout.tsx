import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { NetworkBar } from './NetworkBar'

function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [pathname])

    return null
}

export default function Layout() {
    return (
        <div className="relative flex flex-col min-h-screen">
            {/* Mesh gradient background */}
            <div className="mesh-gradient-bg" />

            <ScrollToTop />

            {/* Sticky nav block: NetworkBar + Header together */}
            <div className="sticky top-0 left-0 right-0 z-50 w-full">
                <NetworkBar />
                <Header />
            </div>

            <main className="relative z-10 flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
