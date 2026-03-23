// Module-level singleton config — set once by EcosystemProvider, read by API functions.
// This pattern allows plain (non-hook) async functions to access apiUrl/siteId
// without requiring React context.

interface EcosystemConfig {
    apiUrl: string
    siteId: string
}

let _config: EcosystemConfig = { apiUrl: '', siteId: '' }

export function setEcosystemConfig(config: EcosystemConfig): void {
    _config = config
}

export function getEcosystemConfig(): EcosystemConfig {
    return _config
}
