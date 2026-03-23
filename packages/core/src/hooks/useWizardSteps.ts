import { useQuery } from '@tanstack/react-query'
import { getWizardSteps } from '../api'
import { useEcosystem } from '../EcosystemProvider'
import type { WizardStepData } from '../api'

export function useWizardSteps() {
    const { siteId } = useEcosystem()
    return useQuery({
        queryKey: ['wizard-steps', siteId],
        queryFn: () => getWizardSteps() as Promise<{ data: WizardStepData[] }>,
        staleTime: 5 * 60 * 1000,
    })
}
