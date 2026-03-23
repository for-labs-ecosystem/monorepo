import { useQuery } from '@tanstack/react-query'
import { getArticles, getArticle } from '../api'
import { useEcosystem } from '../EcosystemProvider'
import type { Article } from '@forlabs/shared'

export function useArticles(params?: Record<string, string | number | undefined>) {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['articles', siteId, params],
        queryFn: () => getArticles(params) as Promise<{ data: Article[]; count: number }>,
    })
}

export function useArticle(slugOrId: string) {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['article', siteId, slugOrId],
        queryFn: () => getArticle(slugOrId) as Promise<{ data: Article }>,
        enabled: !!slugOrId,
    })
}
