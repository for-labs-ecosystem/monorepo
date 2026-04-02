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
            {/* Dreamy ambient glows — subtle, warm, alive */}
            <div className="glow-mint" style={{ top: '-300px', left: '-250px' }} />
            <div className="glow-peach" style={{ top: '400px', right: '-200px' }} />
            <div className="glow-ocean" style={{ bottom: '200px', left: '15%' }} />
            <div className="glow-peach" style={{ bottom: '-100px', right: '20%', opacity: 0.5 }} />

            <ScrollToTop />
            <NetworkBar />
            <header className="sticky top-0 left-0 right-0 z-50 w-full">
                <Header />
            </header>
            <main className="relative z-10 flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
