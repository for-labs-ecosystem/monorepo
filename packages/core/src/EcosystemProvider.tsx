import { createContext, useContext, type ReactNode } from 'react'
import { setEcosystemConfig } from './config'

interface EcosystemContextValue {
    apiUrl: string
    siteId: string
}

const EcosystemContext = createContext<EcosystemContextValue | null>(null)

interface EcosystemProviderProps {
    apiUrl: string
    siteId: string
    children: ReactNode
}

export function EcosystemProvider({ apiUrl, siteId, children }: EcosystemProviderProps) {
    // Set module-level config synchronously so plain API functions work immediately
    setEcosystemConfig({ apiUrl, siteId })

    return (
        <EcosystemContext.Provider value={{ apiUrl, siteId }}>
            {children}
        </EcosystemContext.Provider>
    )
}

export function useEcosystem(): EcosystemContextValue {
    const ctx = useContext(EcosystemContext)
    if (!ctx) throw new Error('useEcosystem must be used within EcosystemProvider')
    return ctx
}
