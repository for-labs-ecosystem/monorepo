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
        <div className="flex flex-col min-h-screen bg-blueprint-grid">
            <ScrollToTop />
            <NetworkBar />
            <div className="sticky top-0 left-0 right-0 z-50">
                <Header />
            </div>
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
