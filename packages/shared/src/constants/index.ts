// @forlabs/shared — Domain ↔ Site Slug mapping
// Used by the tenant middleware to resolve Host header → site_id

export const DOMAIN_MAP: Record<string, string> = {
    "for-labs.com": "forlabs",
    "www.for-labs.com": "forlabs",
    "atagotr.com": "atagotr",
    "www.atagotr.com": "atagotr",
    "gidakimya.com": "gidakimya",
    "www.gidakimya.com": "gidakimya",
    "labkurulum.com": "labkurulum",
    "www.labkurulum.com": "labkurulum",
    "gidatest.com": "gidatest",
    "www.gidatest.com": "gidatest",
    "alerjen.net": "alerjen",
    "www.alerjen.net": "alerjen",
    "hijyenkontrol.com": "hijyenkontrol",
    "www.hijyenkontrol.com": "hijyenkontrol",
    // Local development
    "localhost": "forlabs",
} as const;

export const DEFAULT_SITE_SLUG = "forlabs";
