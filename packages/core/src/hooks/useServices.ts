import { useQuery } from '@tanstack/react-query'
import { getServices, getService } from '../api'
import { useEcosystem } from '../EcosystemProvider'
import type { Service } from '@forlabs/shared'

export function useServices(params?: Record<string, string | number | undefined>) {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['services', siteId, params],
        queryFn: () => getServices(params) as Promise<{ data: Service[]; count: number }>,
    })
}

export function useService(slugOrId: string) {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['service', siteId, slugOrId],
        queryFn: () => getService(slugOrId) as Promise<{ data: Service }>,
        enabled: !!slugOrId,
    })
}
