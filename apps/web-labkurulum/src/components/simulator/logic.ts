// ─────────────────────────────────────────────────────────────────────────────
// PROJE SİMÜLATÖRÜ — STATİK KURAL MOTORU
// apps/web-labkurulum/src/components/simulator/logic.ts
//
// Bu dosya, simülatörün tüm karar mantığını içerir.
// Admin paneline dokunulmaz; kurallar frontend'de statik tanımlıdır.
// ─────────────────────────────────────────────────────────────────────────────

// ────────── WIZARD ADIM TİPLERİ ──────────

export type ScopeChoice = 'infrastructure' | 'instruments' | 'turnkey'

export type IndustryChoice = 'food_safety' | 'chem_industrial' | 'clinical_rnd'

export type CapacityChoice = 'small' | 'medium' | 'large'

export interface WizardAnswers {
    scope: ScopeChoice | null
    area_m2: number | null
    room_count: number | null
    industry: IndustryChoice | null
    capacity: CapacityChoice | null
}

// ────────── KURAL SABİTLERİ ──────────

/** 1 oda başına minimum mobilya birimi */
export const PER_ROOM_FURNITURE: Record<string, { label: string; qty: number }> = {
    cekerOcak: { label: 'Çeker Ocak', qty: 1 },
    tezgah: { label: 'Tezgah (ml cinsinden)', qty: 2 },
    lavabo: { label: 'Lavabo Ünitesi', qty: 1 },
    dolap: { label: 'Kimyasal Depo Dolabı', qty: 1 },
}

/** m² başına minimum aydınlatma (adet) */
export const PER_M2_LIGHTING = 0.2  // her 5m²'ye 1 armatür

/** Kapasite çarpanları */
export const CAPACITY_MULTIPLIERS: Record<CapacityChoice, number> = {
    small: 1.0,   // 1-3 kişi
    medium: 1.6,  // 4-10 kişi
    large: 2.5,   // 10+ kişi
}

/** Endüstri → API'de aranacak tag'ler (etiketler/anahtar kelimeler) */
export const INDUSTRY_TAGS: Record<IndustryChoice, string[]> = {
    food_safety: ['gıda', 'food', 'alerjen', 'allergen', 'hygiene', 'hijyen', 'gmp'],
    chem_industrial: ['kimya', 'chemical', 'endüstriyel', 'industrial', 'titrasyon', 'lab'],
    clinical_rnd: ['klinik', 'clinical', 'ar-ge', 'rnd', 'mikrobiyoloji', 'pharmaceutical'],
}

/** Endüstri → çapraz ekosistem domain'leri (DOMAIN_MAP ile uyumlu) */
export const INDUSTRY_ECOSYSTEM_DOMAINS: Record<IndustryChoice, Array<{ domain: string; label: string }>> = {
    food_safety: [
        { domain: 'gidatest.com', label: 'GıdaTest' },
        { domain: 'alerjen.net', label: 'Alerjen.net' },
        { domain: 'hijyenkontrol.com', label: 'HijyenKontrol' },
    ],
    chem_industrial: [
        { domain: 'gidakimya.com', label: 'GıdaKimya' },
        { domain: 'atagotr.com', label: 'Atago TR' },
    ],
    clinical_rnd: [
        { domain: 'atagotr.com', label: 'Atago TR' },
        { domain: 'gidakimya.com', label: 'GıdaKimya' },
    ],
}

// ────────── HESAPLAMA MOTORU ──────────

export interface FurnitureItem {
    label: string
    qty: number
    unit: string
    note?: string
}

export interface InstrumentSuggestion {
    tag: string
    ecosystem: Array<{ domain: string; label: string }>
}

export interface SimulationResult {
    furniture: FurnitureItem[]
    lighting_count: number
    instrument_tags: string[]
    ecosystem_domains: Array<{ domain: string; label: string }>
    capacity_label: string
    scope_label: string
    scope_choice: ScopeChoice | null
    industry_label: string | null
    total_rooms: number
    total_area: number
    estimated_duration_weeks: { min: number; max: number }
    complexity: 'Standart' | 'Orta' | 'Karmaşık'
}

export function computeSimulation(answers: WizardAnswers): SimulationResult {
    const {
        scope,
        area_m2,
        room_count,
        industry,
        capacity,
    } = answers

    const multiplier = capacity ? CAPACITY_MULTIPLIERS[capacity] : 1.0
    const rooms = room_count ?? 1
    const area = area_m2 ?? 30

    // ── Mobilya Hesabı (A ve C scopeları için) ──
    const furniture: FurnitureItem[] = []
    if (scope === 'infrastructure' || scope === 'turnkey') {
        furniture.push({
            label: PER_ROOM_FURNITURE.cekerOcak.label,
            qty: Math.ceil(PER_ROOM_FURNITURE.cekerOcak.qty * rooms * multiplier),
            unit: 'adet',
            note: 'Saatte ≥10 hava değişimi kapasiteli',
        })
        furniture.push({
            label: PER_ROOM_FURNITURE.tezgah.label,
            qty: Math.ceil(PER_ROOM_FURNITURE.tezgah.qty * rooms * multiplier * 0.8),
            unit: 'm',
            note: 'Kimyasal dayanımlı yüzey',
        })
        furniture.push({
            label: PER_ROOM_FURNITURE.lavabo.label,
            qty: Math.ceil(PER_ROOM_FURNITURE.lavabo.qty * rooms),
            unit: 'adet',
            note: 'Hands-free armatür önerilir',
        })
        furniture.push({
            label: PER_ROOM_FURNITURE.dolap.label,
            qty: Math.ceil(PER_ROOM_FURNITURE.dolap.qty * rooms * multiplier * 0.5),
            unit: 'adet',
            note: 'Yangın sınıfı F90',
        })
    }

    // ── Aydınlatma ──
    const lighting_count = scope === 'infrastructure' || scope === 'turnkey'
        ? Math.ceil(area * PER_M2_LIGHTING * multiplier)
        : 0

    // ── Cihaz Tag'leri (B ve C scopeları için) ──
    const instrument_tags = (scope === 'instruments' || scope === 'turnkey') && industry
        ? INDUSTRY_TAGS[industry]
        : []

    const ecosystem_domains = (scope === 'instruments' || scope === 'turnkey') && industry
        ? INDUSTRY_ECOSYSTEM_DOMAINS[industry]
        : []

    // ── Süre Tahmini ──
    let weeks = { min: 4, max: 8 }
    if (scope === 'turnkey') {
        weeks = { min: 12, max: 20 }
    } else if (scope === 'instruments') {
        weeks = { min: 2, max: 5 }
    }
    if (multiplier >= CAPACITY_MULTIPLIERS.large) {
        weeks = { min: Math.ceil(weeks.min * 1.4), max: Math.ceil(weeks.max * 1.6) }
    } else if (multiplier >= CAPACITY_MULTIPLIERS.medium) {
        weeks = { min: Math.ceil(weeks.min * 1.2), max: Math.ceil(weeks.max * 1.3) }
    }

    // ── Karmaşıklık ──
    let complexity: SimulationResult['complexity'] = 'Standart'
    if (scope === 'turnkey' && multiplier >= CAPACITY_MULTIPLIERS.large) {
        complexity = 'Karmaşık'
    } else if (scope === 'turnkey' || multiplier >= CAPACITY_MULTIPLIERS.medium) {
        complexity = 'Orta'
    }

    // ── Etiket Çevirileri ──
    const SCOPE_LABELS: Record<ScopeChoice, string> = {
        infrastructure: 'Laboratuvar Mobilyası & Altyapı',
        instruments: 'Analiz Cihazları',
        turnkey: 'Anahtar Teslim Kurulum',
    }

    const INDUSTRY_LABELS: Record<IndustryChoice, string> = {
        food_safety: 'Gıda Güvenliği',
        chem_industrial: 'Kimya & Endüstriyel',
        clinical_rnd: 'Klinik & Ar-Ge',
    }

    const CAPACITY_LABELS: Record<CapacityChoice, string> = {
        small: '1–3 Analist',
        medium: '4–10 Analist',
        large: '10+ Analist',
    }

    return {
        furniture,
        lighting_count,
        instrument_tags,
        ecosystem_domains,
        capacity_label: capacity ? CAPACITY_LABELS[capacity] : '—',
        scope_label: scope ? SCOPE_LABELS[scope] : '—',
        scope_choice: scope,
        industry_label: industry ? INDUSTRY_LABELS[industry] : null,
        total_rooms: rooms,
        total_area: area,
        estimated_duration_weeks: weeks,
        complexity,
    }
}

// ────────── ADIM VİZİBİLİTY KURALLARI ──────────

/** Adım 2 (fiziksel alan) sadece infrastructure veya turnkey seçilirse gösterilmeli */
export function showPhysicalStep(scope: ScopeChoice | null): boolean {
    return scope === 'infrastructure' || scope === 'turnkey'
}

/** Adım 3 (endüstri) sadece instruments veya turnkey seçilirse gösterilmeli */
export function showIndustryStep(scope: ScopeChoice | null): boolean {
    return scope === 'instruments' || scope === 'turnkey'
}
