import { useQuery } from '@tanstack/react-query'
import { getProducts, getCategories, getProduct } from '../api'
import { useEcosystem } from '../EcosystemProvider'
import type { Product, Category } from '@forlabs/shared'

export function useProducts(params?: Record<string, string | number | undefined>) {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['products', siteId, params],
        queryFn: () => getProducts(params) as Promise<{ data: Product[]; count: number }>,
    })
}

export function useProduct(slugOrId: string) {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['product', siteId, slugOrId],
        queryFn: () => getProduct(slugOrId) as Promise<{ data: Product }>,
        enabled: !!slugOrId,
    })
}

export function useCategories(params?: Record<string, string | number | undefined>) {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['categories', siteId, params],
        queryFn: () => getCategories(params) as Promise<{ data: Category[] }>,
    })
}
