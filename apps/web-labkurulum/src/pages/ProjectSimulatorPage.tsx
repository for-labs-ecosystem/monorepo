import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import {
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    Building2,
    FlaskConical,
    Wrench,
    Users,
    Users2,
    UserCheck,
    ExternalLink,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Terminal,
    X,
    Send,
    CheckCircle,
    Atom,
    HeartPulse,
    Leaf,
} from 'lucide-react'
import { getProducts, submitInquiry } from '@forlabs/core'
import type { Product } from '@forlabs/shared'
import {
    type ScopeChoice,
    type IndustryChoice,
    type CapacityChoice,
    type WizardAnswers,
    type SimulationResult,
    computeSimulation,
    showPhysicalStep,
    showIndustryStep,
} from '@/components/simulator/logic'

// ────────── CONSTANTS ──────────
const SITE_ID = import.meta.env.VITE_SITE_ID as string

// Ekosistem domain → product site query id mapping (ilerde kullanılabilir)
// const DOMAIN_SITE_IDS = { 'gidatest.com': 3, ... }

const LOADING_MESSAGES = [
    'Mimari gereksinimler analiz ediliyor...',
    'Yapısal metraj hesaplanıyor...',
    'Standart katsayıları uygulanıyor...',
    'Ekosistem cihazları eşleştiriliyor...',
    'TSE & ISO uyumluluk kontrolü yapılıyor...',
    'Keşif raporu derleniyor...',
    'Proforma hazırlanıyor...',
]

// ────────── UTILITY TYPES ──────────
type WizardPhase = 'wizard' | 'loading' | 'result'

// ────────── STEP COMPONENTS ──────────

interface StepProps {
    visible: boolean
    children: React.ReactNode
}
function AnimatedStep({ visible, children }: StepProps) {
    return (
        <div
            style={{
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                pointerEvents: visible ? 'auto' : 'none',
                position: visible ? 'relative' : 'absolute',
                width: '100%',
            }}
        >
            {children}
        </div>
    )
}

interface OptionCardProps {
    selected: boolean
    onClick: () => void
    icon: React.ReactNode
    title: string
    description: string
    id: string
}
function OptionCard({ selected, onClick, icon, title, description, id }: OptionCardProps) {
    return (
        <button
            id={id}
            onClick={onClick}
            className={`group w-full text-left p-5 rounded-sm border-2 transition-all duration-200 cursor-pointer ${
                selected
                    ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                    : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
            }`}
        >
            <div className="flex items-start gap-4">
                <div
                    className={`shrink-0 w-11 h-11 rounded-sm flex items-center justify-center transition-colors duration-200 ${
                        selected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600'
                    }`}
                >
                    {icon}
                </div>
                <div>
                    <p className={`font-semibold text-[15px] leading-tight mb-1 transition-colors ${selected ? 'text-brand-700' : 'text-slate-800'}`}>
                        {title}
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                </div>
                <div className={`ml-auto shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'}`}>
                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
            </div>
        </button>
    )
}

// ────────── STEP INDICATOR ──────────
function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
    return (
        <div className="flex items-center gap-0 mb-10">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex items-center">
                    <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all duration-300 ${
                            i < current
                                ? 'bg-brand-500 text-white'
                                : i === current
                                    ? 'bg-brand-50 border border-brand-400 text-brand-700'
                                    : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        <span className="font-mono text-xs font-bold">
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="hidden sm:block text-xs font-medium">{labels[i]}</span>
                    </div>
                    {i < total - 1 && (
                        <div className={`h-px w-6 mx-0.5 transition-colors ${i < current ? 'bg-brand-400' : 'bg-slate-200'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

// ────────── TERMINAL LOADER ──────────
function TerminalLoader({ onComplete }: { onComplete: () => void }) {
    const [lines, setLines] = useState<string[]>([])
    const [cursor, setCursor] = useState(true)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        let idx = 0
        const push = () => {
            if (idx < LOADING_MESSAGES.length) {
                setLines((prev) => [...prev, LOADING_MESSAGES[idx]])
                idx++
                timerRef.current = setTimeout(push, 280)
            } else {
                timerRef.current = setTimeout(onComplete, 600)
            }
        }
        timerRef.current = setTimeout(push, 300)
        const blink = setInterval(() => setCursor((c) => !c), 500)
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            clearInterval(blink)
        }
    }, [onComplete])

    return (
        <div className="min-h-screen bg-brand-900 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                {/* Terminal window chrome */}
                <div className="rounded-sm overflow-hidden shadow-2xl border border-brand-700">
                    <div className="bg-brand-800 px-4 py-3 flex items-center gap-2 border-b border-brand-700">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                        <span className="ml-4 font-mono text-xs text-brand-400 tracking-widest uppercase">
                            forlabs-lab-simulator — keşif-raporu.sh
                        </span>
                    </div>
                    <div className="bg-brand-950 p-6 min-h-64 font-mono text-sm">
                        <div className="text-green-400 mb-4 text-xs tracking-widest">
                            $ ./generate-discovery-report.sh --format=proforma --lang=TR
                        </div>
                        {lines.map((line, i) => (
                            <div key={i} className="flex items-start gap-3 mb-2 animate-fade-in-up">
                                <span className="text-accent-400 shrink-0">▶</span>
                                <span className="text-slate-300">{line}</span>
                                {i === lines.length - 1 && (
                                    <span className="text-green-400 ml-1">
                                        {lines.length === LOADING_MESSAGES.length ? (
                                            <CheckCircle2 className="inline w-4 h-4" />
                                        ) : (
                                            <span className="animate-pulse">…</span>
                                        )}
                                    </span>
                                )}
                            </div>
                        ))}
                        <span className={`inline-block w-2 h-4 bg-green-400 mt-2 ${cursor ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                    </div>
                </div>
                <p className="text-center text-brand-400 font-mono text-xs mt-6 tracking-wider animate-pulse">
                    MühendislikKeşifRaporu — FOR-LABS ENDÜSTRİYEL SİSTEMLER A.Ş.
                </p>
            </div>
        </div>
    )
}

// ────────── INQUIRY MODAL ──────────
const SITE_ID_NUM = Number(import.meta.env.VITE_SITE_ID)

interface InquiryModalProps {
    reportNo: string
    result: SimulationResult
    matchedProducts: Product[]
    onClose: () => void
}

function buildInquiryMessage(reportNo: string, result: SimulationResult, products: Product[]): string {
    const lines: string[] = []
    const today = new Date().toLocaleDateString('tr-TR', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

    lines.push('═══════════════════════════════════════')
    lines.push(`  MÜHENDİSLİK KEŞİF RAPORU — ${reportNo}`)
    lines.push(`  FOR-LABS ENDÜSTRİYEL LABORATUVAR SİSTEMLERİ`)
    lines.push(`  Rapor Tarihi: ${today}`)
    lines.push('═══════════════════════════════════════')
    lines.push('')

    // ── GENEL KAPSAM BİLGİSİ ──
    lines.push('▌ PROJE KAPSAMI')
    lines.push(`  Kapsam  : ${result.scope_label}`)
    if (result.capacity_label && result.scope_choice !== 'instruments') {
        lines.push(`  Kapasite: ${result.capacity_label}`)
    }
    if (result.industry_label) {
        lines.push(`  Endüstri: ${result.industry_label}`)
    }
    if (result.scope_choice !== 'instruments') {
        if (result.total_area > 0) lines.push(`  Alan    : ${result.total_area} m²`)
        if (result.total_rooms > 0) lines.push(`  Odalar  : ${result.total_rooms} adet`)
        lines.push(`  Karmaşıklık: ${result.complexity}`)
    }
    lines.push(`  Tahmini Süre: ${result.estimated_duration_weeks.min}–${result.estimated_duration_weeks.max} hafta`)
    lines.push('')

    // ── ALTYapi / MOBİLYA LİSTESİ ──
    if (result.furniture.length > 0 || result.lighting_count > 0) {
        lines.push('▌ ALTYAPI & MOBİLYA KEŞİF LİSTESİ')
        result.furniture.forEach((item) => {
            lines.push(`  • ${item.label.padEnd(30)} ${item.qty} ${item.unit}${item.note ? ` — ${item.note}` : ''}`)
        })
        if (result.lighting_count > 0) {
            lines.push(`  • LED Laboratuvar Armатürü              ${result.lighting_count} adet — ≥75 lüks, IP54`)
        }
        lines.push('')
    }

    // ── ÖNERİLEN ÜRÜNLER ──
    if (products.length > 0) {
        lines.push('▌ EŞLEŞEN ANALİZ CİHAZLARI (Ekosistem Öneri)')
        const domains = result.ecosystem_domains
        products.slice(0, 6).forEach((p, i) => {
            const eco = domains[0]
            const ecoLabel = eco ? eco.label : 'For-Labs'
            const url = eco ? `https://${eco.domain}/urunler/${p.slug}` : `https://for-labs.com/urunler/${p.slug}`
            lines.push(`  ${i + 1}. ${p.title}`)
            if (p.brand) lines.push(`     Marka : ${p.brand}`)
            lines.push(`     Kaynak: ${ecoLabel}`)
            lines.push(`     URL   : ${url}`)
        })
        lines.push('')
    }

    // ── EKOSİSTEM SİTELERİ ──
    if (result.ecosystem_domains.length > 0) {
        lines.push('▌ EKİVALEN EKOSİSTEM SİTELERİ')
        result.ecosystem_domains.forEach((eco) => {
            lines.push(`  • ${eco.label} — https://${eco.domain}`)
        })
        lines.push('')
    }

    lines.push('───────────────────────────────────────')
    lines.push('  Bu talep, Lab Kurulum Proje Simülatörü aracılığıyla iletilmiştir.')
    lines.push(`  Rapor No: ${reportNo}`)

    return lines.join('\n')
}

function InquiryModal({ reportNo, result, matchedProducts, onClose }: InquiryModalProps) {
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        company: '',
    })

    const mutation = useMutation({
        mutationFn: () =>
            submitInquiry({
                site_id: SITE_ID_NUM,
                sender_name: form.full_name,
                sender_email: form.email,
                phone: form.phone || undefined,
                company: form.company || undefined,
                subject: `📊 Keşif Raporu Teklif Talebi [${reportNo}] — ${result.scope_label}`,
                message: buildInquiryMessage(reportNo, result, matchedProducts),
                type: 'quote',
            }),
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        mutation.mutate()
    }

    // Close on backdrop click
    function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/70 backdrop-blur-sm"
            onClick={handleBackdrop}
        >
            <div className="w-full max-w-lg bg-white rounded-sm shadow-2xl border border-slate-200 overflow-hidden">
                {/* Modal header */}
                <div className="bg-brand-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="font-mono text-[10px] text-brand-300 uppercase tracking-widest mb-0.5">
                            Rapor No: {reportNo}
                        </div>
                        <h2 className="font-bold text-white text-base">Proje Teklifi Talebi</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-brand-300 hover:text-white transition-colors p-1"
                        id="modal-close-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {mutation.isSuccess ? (
                    /* Success state */
                    <div className="px-8 py-12 text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Talebiniz Alındı!</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Mühendislik ekibimiz <strong>{reportNo}</strong> numaralı kapsam raporunuzu inceleyerek
                            24 saat içinde sizinle iletişime geçecektir.
                        </p>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm bg-brand-600 text-white text-sm font-bold uppercase tracking-wider"
                        >
                            Kapat
                        </button>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                        <p className="font-mono text-xs text-slate-500 border-l-2 border-brand-400 pl-3 mb-5">
                            İletişim bilgilerinizi bırakın, mühendislik ekibimiz bu keşif raporu ({result.scope_label}) için size detaylı teklifle dönsün.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                                    Ad Soyad *
                                </label>
                                <input
                                    id="modal-name"
                                    name="full_name"
                                    required
                                    value={form.full_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                                    E-posta *
                                </label>
                                <input
                                    id="modal-email"
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                                    Telefon
                                </label>
                                <input
                                    id="modal-phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                                    Kurum / Firma
                                </label>
                                <input
                                    id="modal-company"
                                    name="company"
                                    value={form.company}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {mutation.isError && (
                            <div className="p-3 border border-red-200 rounded-sm bg-red-50 text-sm text-red-700">
                                Gönderim hatası oluştu. Lütfen tekrar deneyin.
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <p className="font-mono text-[10px] text-slate-400">
                                24 saat içinde dönüş garantisi
                            </p>
                            <button
                                id="modal-submit-btn"
                                type="submit"
                                disabled={mutation.isPending}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm bg-accent-500 text-brand-900 text-[13px] font-bold uppercase tracking-wider transition-all hover:bg-accent-400 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {mutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-brand-900/30 border-t-brand-900 rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                                {mutation.isPending ? 'Gönderiliyor...' : 'Teklif Talep Et'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

// ────────── RESULT REPORT ──────────
interface ResultReportProps {
    result: SimulationResult
    matchedProducts: Product[]
    onReset: () => void
}

function ResultReport({ result, matchedProducts, onReset }: ResultReportProps) {
    const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const reportNo = `LK-${Date.now().toString(36).toUpperCase().slice(-6)}`
    const [modalOpen, setModalOpen] = useState(false)

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [])

    const isInstrumentsOnly = result.scope_choice === 'instruments'

    const complexityColor: Record<SimulationResult['complexity'], string> = {
        Standart: 'text-green-700 bg-green-50 border-green-200',
        Orta: 'text-amber-700 bg-amber-50 border-amber-200',
        Karmaşık: 'text-red-700 bg-red-50 border-red-200',
    }

    function getExploreUrl(product: Product, domain: string): string {
        return `https://${domain}/urunler/${product.slug}`
    }

    // Match products to ecosystem domains
    const productWithDomains = matchedProducts.slice(0, 6).map((p) => ({
        product: p,
        domain: result.ecosystem_domains[0]?.domain ?? 'for-labs.com',
        domainLabel: result.ecosystem_domains[0]?.label ?? 'For-Labs',
    }))

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4">
            {/* Blueprint grid overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(30, 64, 175, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(30, 64, 175, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Report Header */}
                <div className="bg-white border-2 border-slate-200 rounded-sm shadow-sm mb-0">
                    {/* Top band */}
                    <div className="bg-brand-700 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent-400 rounded-sm flex items-center justify-center">
                                <FileText className="w-4 h-4 text-brand-900" />
                            </div>
                            <div>
                                <div className="font-mono text-xs text-brand-300 uppercase tracking-widest">Mühendislik Keşif Raporu</div>
                                <div className="font-bold text-white text-sm">FOR-LABS ENDÜSTRİYEL LABORATUVAR SİSTEMLERİ</div>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="font-mono text-xs text-brand-300">Rapor No</div>
                            <div className="font-mono text-accent-400 font-bold text-sm">{reportNo}</div>
                        </div>
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200">
                        {[
                            { label: 'Tarih', value: today },
                            { label: 'Kapsam', value: result.scope_label },
                            ...(!isInstrumentsOnly ? [{ label: 'Kapasite', value: result.capacity_label }] : []),
                            ...(!isInstrumentsOnly ? [{ label: 'Karmaşıklık', value: result.complexity, highlight: true }] : []),
                        ].map((item) => (
                            <div key={item.label} className="px-5 py-3.5 border-r last:border-r-0 border-slate-200">
                                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">{item.label}</div>
                                <div className={`font-semibold text-sm ${'highlight' in item && item.highlight ? complexityColor[result.complexity as SimulationResult['complexity']].split(' ')[0] : 'text-slate-800'}`}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Industry & Area row — instruments scope hariç */}
                    {(result.industry_label || (!isInstrumentsOnly && result.total_area > 0)) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 border-b border-slate-200">
                            {result.industry_label && (
                                <div className="px-5 py-3.5 border-r border-slate-200">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">Endüstri Standardı</div>
                                    <div className="font-semibold text-sm text-slate-800">{result.industry_label}</div>
                                </div>
                            )}
                            {!isInstrumentsOnly && result.total_area > 0 && (
                                <div className="px-5 py-3.5 border-r border-slate-200">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">Toplam Alan</div>
                                    <div className="font-mono font-bold text-brand-700 text-sm">{result.total_area} m²</div>
                                </div>
                            )}
                            {!isInstrumentsOnly && result.total_rooms > 0 && (
                                <div className="px-5 py-3.5">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">Oda Sayısı</div>
                                    <div className="font-mono font-bold text-brand-700 text-sm">{result.total_rooms} adet</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Duration banner */}
                    <div className="bg-brand-50 border-b border-slate-200 px-6 py-3.5 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                        <span className="font-mono text-[11px] uppercase text-slate-500 tracking-widest">Tahmini Proje Süresi</span>
                        <span className="font-mono font-bold text-brand-700">
                            {result.estimated_duration_weeks.min}–{result.estimated_duration_weeks.max} hafta
                        </span>
                    </div>
                </div>

                {/* Section: Altyapı Listesi */}
                {result.furniture.length > 0 && (
                    <section className="bg-white border-2 border-slate-200 border-t-0 shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="w-6 h-6 bg-brand-700 rounded-sm flex items-center justify-center">
                                <span className="font-mono text-white text-[10px] font-bold">01</span>
                            </div>
                            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-slate-700">
                                Altyapı & Mobilya — Keşif Listesi
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full font-mono text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Kalem</th>
                                        <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Adet / Birim</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-semibold hidden sm:table-cell">Teknik Not</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.furniture.map((item, i) => (
                                        <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                                            <td className="px-6 py-3.5 font-semibold text-slate-800">{item.label}</td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-brand-700 font-bold">{item.qty}</span>
                                                <span className="text-slate-500 ml-1 text-xs">{item.unit}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-slate-500 text-xs hidden sm:table-cell">{item.note ?? '—'}</td>
                                        </tr>
                                    ))}
                                    {result.lighting_count > 0 && (
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <td className="px-6 py-3.5 font-semibold text-slate-800">LED Laboratuvar Armatürü</td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-brand-700 font-bold">{result.lighting_count}</span>
                                                <span className="text-slate-500 ml-1 text-xs">adet</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-slate-500 text-xs hidden sm:table-cell">≥750 lüks, IP54 sınıfı</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 bg-amber-50/60 border-t border-amber-100 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="font-mono text-[11px] text-amber-700">
                                Bu liste oransal modelleme çıktısıdır. Kesin metraj için saha ölçümü ve detaylı proje çizimi gereklidir.
                            </p>
                        </div>
                    </section>
                )}

                {/* Section: Ekosistem Cihaz Önerileri */}
                {result.ecosystem_domains.length > 0 && (
                    <section className="bg-white border-2 border-slate-200 border-t-0 shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="w-6 h-6 bg-brand-700 rounded-sm flex items-center justify-center">
                                <span className="font-mono text-white text-[10px] font-bold">02</span>
                            </div>
                            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-slate-700">
                                Çapraz Ekosistem — Analiz Cihazı Önerileri
                            </h2>
                        </div>

                        {productWithDomains.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x sm:divide-y divide-slate-100">
                                {productWithDomains.map(({ product, domain, domainLabel }) => (
                                    <div key={product.id} className="group p-5 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-sm bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_URL}${product.image_url}`}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FlaskConical className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">{domainLabel}</div>
                                                <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{product.title}</p>
                                            </div>
                                        </div>
                                        {product.brand && (
                                            <div className="font-mono text-xs text-slate-500 mb-3">
                                                <span className="text-slate-400">Marka:</span> {product.brand}
                                            </div>
                                        )}
                                        <a
                                            href={getExploreUrl(product, domain)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            id={`explore-${product.id}`}
                                            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-brand-600 hover:text-brand-700 font-semibold group-hover:underline"
                                        >
                                            İncele <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="font-mono text-sm text-slate-500">
                                    Cihaz verileri API'den yükleniyor&hellip;
                                </p>
                                <p className="font-mono text-xs text-slate-400 mt-2">
                                    Eşleştirilen etiketler: {result.instrument_tags.slice(0, 3).join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Ecosystem domain links */}
                        <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap gap-3">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 self-center">
                                Ekosistem Siteleri:
                            </span>
                            {result.ecosystem_domains.map((eco) => (
                                <a
                                    key={eco.domain}
                                    href={`https://${eco.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-mono text-xs text-brand-600 hover:text-brand-800 border border-brand-200 hover:border-brand-400 rounded-sm px-2.5 py-1 transition-colors"
                                >
                                    {eco.label} <ExternalLink className="w-3 h-3" />
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section: Sonraki Adım */}
                <section className="bg-brand-700 border-2 border-brand-600 border-t-0 shadow-sm">
                    <div className="px-6 py-4 border-b border-brand-600 flex items-center gap-3">
                        <div className="w-6 h-6 bg-accent-400 rounded-sm flex items-center justify-center">
                            <span className="font-mono text-brand-900 text-[10px] font-bold">03</span>
                        </div>
                        <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">
                            Sonraki Adım
                        </h2>
                    </div>
                    <div className="px-6 py-6 sm:flex items-center justify-between gap-6">
                        <div>
                            <p className="text-white font-semibold text-base mb-2">
                                Mühendislik ekibimiz bu keşif raporunu incelesin
                            </p>
                            <p className="text-brand-300 text-sm leading-relaxed">
                                Rapor numaranızı ({reportNo}) paylaşarak gerçek metraj ve detaylı teknik teklif talep edin.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-4 sm:mt-0 shrink-0">
                            <button
                                id="simulator-cta-contact"
                                onClick={() => setModalOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-accent-400 text-brand-900 text-[13px] font-bold uppercase tracking-wider transition-all duration-200 hover:bg-accent-300 hover:shadow-lg dimension-line"
                            >
                                Proje Teklifi Al
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={onReset}
                                id="simulator-restart"
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-sm border border-brand-500 text-brand-200 text-[13px] uppercase tracking-wider transition-colors hover:border-brand-300 hover:text-white font-mono"
                            >
                                Yeniden Başlat
                            </button>
                        </div>
                    </div>
                </section>

                {/* Disclaimer footer */}
                <div className="mt-6 px-4 py-4 border border-slate-200 rounded-sm bg-white/80 backdrop-blur-sm">
                    <p className="font-mono text-[10px] text-slate-400 text-center leading-relaxed">
                        Bu belge bir keşif raporu ve ön proforma niteliğinde olup hukuki bağlayıcılığı yoktur.
                        Kesin teklifler saha ziyareti ve mimari çizimler tamamlandıktan sonra sunulur.
                        FOR-LABS ENDÜSTRİYEL SİSTEMLER A.Ş. — {new Date().getFullYear()}
                    </p>
                </div>
            </div>

            {/* Inquiry Modal */}
            {modalOpen && (
                <InquiryModal
                    reportNo={reportNo}
                    result={result}
                    matchedProducts={matchedProducts}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    )
}

// ────────── WIZARD STEPS ──────────

const STEP_LABELS = ['Kapsam', 'Fiziksel Alan', 'Endüstri', 'Kapasite']

// ────────── MAIN PAGE ──────────

export default function ProjectSimulatorPage() {
    const [phase, setPhase] = useState<WizardPhase>('wizard')
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<WizardAnswers>({
        scope: null,
        area_m2: null,
        room_count: null,
        industry: null,
        capacity: null,
    })
    const [result, setResult] = useState<SimulationResult | null>(null)

    // Compute visible steps based on scope selection
    const visibleSteps = (() => {
        const steps = [0] // always: scope
        if (showPhysicalStep(answers.scope)) steps.push(1) // physical
        if (showIndustryStep(answers.scope)) steps.push(2)  // industry
        steps.push(3) // always: capacity
        return steps
    })()

    const currentVisibleIndex = visibleSteps.indexOf(step)
    const canGoNext = currentVisibleIndex < visibleSteps.length - 1

    // Determine industry tags for querying products
    const industryTags = answers.industry && (answers.scope === 'instruments' || answers.scope === 'turnkey')
        ? (answers.industry === 'food_safety' ? 'gıda' : answers.industry === 'chem_industrial' ? 'kimya' : 'klinik')
        : undefined

    // Query matching products from API (multi-site)
    const extraSiteIds = answers.industry
        ? (answers.industry === 'food_safety' ? [3, 5, 7] : answers.industry === 'chem_industrial' ? [3, 2] : [2])
        : []

    const { data: productsRes } = useQuery({
        queryKey: ['simulator-products', SITE_ID, industryTags, extraSiteIds],
        queryFn: () => getProducts({ search: industryTags }),
        enabled: !!industryTags && phase === 'result',
        staleTime: 5 * 60 * 1000,
    })

    // Also query from ecosystem sites for cross-site products
    const { data: ecosystemProductsRes } = useQuery({
        queryKey: ['simulator-ecosystem-products', extraSiteIds, industryTags],
        queryFn: async () => {
            const results = await Promise.allSettled(
                extraSiteIds.map((sid) =>
                    getProducts({ site_id: sid, search: industryTags })
                )
            )
            const products: Product[] = []
            for (const r of results) {
                if (r.status === 'fulfilled') {
                    products.push(...(r.value.data as Product[]))
                }
            }
            return products
        },
        enabled: !!industryTags && extraSiteIds.length > 0 && phase === 'result',
        staleTime: 5 * 60 * 1000,
    })

    const matchedProducts: Product[] = [
        ...((productsRes?.data as Product[]) ?? []),
        ...(ecosystemProductsRes ?? []),
    ].slice(0, 6)

    function goNext() {
        if (!canGoNext) {
            // Last step — start loading
            setResult(computeSimulation(answers))
            setPhase('loading')
        } else {
            const nextStep = visibleSteps[currentVisibleIndex + 1]
            setStep(nextStep)
        }
    }

    function goPrev() {
        if (currentVisibleIndex > 0) {
            setStep(visibleSteps[currentVisibleIndex - 1])
        }
    }

    function handleLoadingComplete() {
        setPhase('result')
    }

    function handleReset() {
        setAnswers({ scope: null, area_m2: null, room_count: null, industry: null, capacity: null })
        setStep(0)
        setPhase('wizard')
        setResult(null)
    }

    // Update step when scope changes (may skip to valid step)
    function handleScopeSelect(scope: ScopeChoice) {
        setAnswers((prev) => ({ ...prev, scope, industry: null, area_m2: null, room_count: null }))
        // Step 0 stays at 0
    }

    // Step validity check for Next button
    const stepValid = (() => {
        if (step === 0) return answers.scope !== null
        if (step === 1) return answers.area_m2 !== null && answers.area_m2 > 0
        if (step === 2) return answers.industry !== null
        if (step === 3) return answers.capacity !== null
        return false
    })()

    if (phase === 'loading') {
        return <TerminalLoader onComplete={handleLoadingComplete} />
    }

    if (phase === 'result' && result) {
        return (
            <ResultReport
                result={result}
                matchedProducts={matchedProducts}
                onReset={handleReset}
            />
        )
    }

    // Visible step labels
    const visibleLabels = visibleSteps.map((s) => STEP_LABELS[s])

    return (
        <>
            <title>Proje Simülatörü — Lab Kurulum</title>
            <meta
                name="description"
                content="Laboratuvarınızın ihtiyaçlarını adım adım tanımlayın, mühendislik keşif raporu ve ön proforma alın."
            />

            <div className="min-h-screen bg-slate-50 bg-blueprint-grid">
                <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
                    {/* Page header */}
                    <div className="mb-10">
                        <div className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" />
                            FOR-LABS / PROJE SİMÜLATÖRÜ v2
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-3">
                            Laboratuvarınızı<br />
                            <span className="text-brand-600">projelendirin.</span>
                        </h1>
                        <p className="text-slate-500 text-base max-w-xl">
                            Birkaç adımda kapsamınızı tanımlayın; mühendislik ekibimiz için hazır bir keşif raporu ve ön proforma oluşturalım.
                        </p>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator
                        current={currentVisibleIndex}
                        total={visibleSteps.length}
                        labels={visibleLabels}
                    />

                    {/* Step 0: Scope */}
                    <AnimatedStep visible={step === 0}>
                        <div className="mb-8">
                            <div className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-1">Adım 01</div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Size nasıl yardımcı olabiliriz?</h2>
                            <p className="text-slate-500 text-sm">Projenizin genel kapsamını seçin.</p>
                        </div>
                        <div className="space-y-3">
                            <OptionCard
                                id="scope-infrastructure"
                                selected={answers.scope === 'infrastructure'}
                                onClick={() => handleScopeSelect('infrastructure')}
                                icon={<Building2 className="w-5 h-5" />}
                                title="Laboratuvar Mobilyası & Altyapı"
                                description="Tezgah, çeker ocak, lavabo, aydınlatma ve kurulum altyapısı planlama."
                            />
                            <OptionCard
                                id="scope-instruments"
                                selected={answers.scope === 'instruments'}
                                onClick={() => handleScopeSelect('instruments')}
                                icon={<FlaskConical className="w-5 h-5" />}
                                title="Analiz Cihazları"
                                description="Sektörünüze özel ölçüm, test ve analiz cihazı seçimi."
                            />
                            <OptionCard
                                id="scope-turnkey"
                                selected={answers.scope === 'turnkey'}
                                onClick={() => handleScopeSelect('turnkey')}
                                icon={<Wrench className="w-5 h-5" />}
                                title="Anahtar Teslim Kurulum"
                                description="Altyapıdan cihaza, montajdan devreye almaya kadar eksiksiz çözüm."
                            />
                        </div>
                    </AnimatedStep>

                    {/* Step 1: Physical Space */}
                    <AnimatedStep visible={step === 1}>
                        <div className="mb-8">
                            <div className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-1">Adım 02</div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Laboratuvarınızın yapısal detayları</h2>
                            <p className="text-slate-500 text-sm">Toplam alan ve oda sayısına göre mobilya/altyapı katsayıları hesaplanır.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white border border-slate-200 rounded-sm p-5">
                                <label htmlFor="area-input" className="block font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                                    Toplam Alan (m²)
                                </label>
                                <input
                                    id="area-input"
                                    type="number"
                                    min={10}
                                    max={5000}
                                    step={5}
                                    value={answers.area_m2 ?? ''}
                                    onChange={(e) =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            area_m2: e.target.value ? Number(e.target.value) : null,
                                        }))
                                    }
                                    placeholder="Örn: 150"
                                    className="w-full font-mono text-2xl font-bold text-brand-700 bg-transparent outline-none border-b-2 border-slate-200 focus:border-brand-500 py-2 transition-colors placeholder:text-slate-300"
                                />
                                <div className="mt-2 font-mono text-xs text-slate-400">
                                    Minimum 10 m² — Maksimum 5.000 m²
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-sm p-5">
                                <label htmlFor="room-input" className="block font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                                    Oda / Bölüm Sayısı
                                </label>
                                <input
                                    id="room-input"
                                    type="number"
                                    min={1}
                                    max={50}
                                    step={1}
                                    value={answers.room_count ?? ''}
                                    onChange={(e) =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            room_count: e.target.value ? Number(e.target.value) : null,
                                        }))
                                    }
                                    placeholder="Örn: 4"
                                    className="w-full font-mono text-2xl font-bold text-brand-700 bg-transparent outline-none border-b-2 border-slate-200 focus:border-brand-500 py-2 transition-colors placeholder:text-slate-300"
                                />
                                <div className="mt-2 font-mono text-xs text-slate-400">
                                    Her oda bağımsız bir çalışma bölümü olarak değerlendirilir
                                </div>
                            </div>
                        </div>
                    </AnimatedStep>

                    {/* Step 2: Industry */}
                    <AnimatedStep visible={step === 2}>
                        <div className="mb-8">
                            <div className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-1">Adım 03</div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Hangi standartlarda analiz yapacaksınız?</h2>
                            <p className="text-slate-500 text-sm">Endüstri seçiminize göre uygun cihazlar ve ekosistem siteleri eşleştirilir.</p>
                        </div>
                        <div className="space-y-3">
                            <OptionCard
                                id="industry-food"
                                selected={answers.industry === 'food_safety'}
                                onClick={() => setAnswers((prev) => ({ ...prev, industry: 'food_safety' as IndustryChoice }))}
                                icon={<Leaf className="w-5 h-5" />}
                                title="Gıda Güvenliği & Hijyen"
                                description="Mikrobiyolojik analiz, alerjen tespiti, su aktivitesi, pH ve brix ölçümü. Gıda üretim, paketleme ve kalite kontrol tesisleri."
                            />
                            <OptionCard
                                id="industry-chem"
                                selected={answers.industry === 'chem_industrial'}
                                onClick={() => setAnswers((prev) => ({ ...prev, industry: 'chem_industrial' as IndustryChoice }))}
                                icon={<Atom className="w-5 h-5" />}
                                title="Kimya & Endüstriyel Kalite"
                                description="Titrasyon, spektrofotometri, kromatografi ve endüstriyel ham madde ile üretim süreç analizi."
                            />
                            <OptionCard
                                id="industry-clinical"
                                selected={answers.industry === 'clinical_rnd'}
                                onClick={() => setAnswers((prev) => ({ ...prev, industry: 'clinical_rnd' as IndustryChoice }))}
                                icon={<HeartPulse className="w-5 h-5" />}
                                title="Klinik & Biyomedikal Ar-Ge"
                                description="Farmasötik biyokimya, moleküler biyoloji, sterilite testleri; ISO 17025 / GLP uyumlu araştırma ve geliştirme laboratuvarları."
                            />
                        </div>
                    </AnimatedStep>

                    {/* Step 3: Capacity */}
                    <AnimatedStep visible={step === 3}>
                        <div className="mb-8">
                            <div className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-1">
                                Adım {visibleSteps.length.toString().padStart(2, '0')}
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Laboratuvarda aynı anda kaç analist çalışacak?</h2>
                            <p className="text-slate-500 text-sm">Kapasite, mobilya miktarını ve alan gereksinimini doğrudan etkiler.</p>
                        </div>
                        <div className="space-y-3">
                            <OptionCard
                                id="capacity-small"
                                selected={answers.capacity === 'small'}
                                onClick={() => setAnswers((prev) => ({ ...prev, capacity: 'small' as CapacityChoice }))}
                                icon={<UserCheck className="w-5 h-5" />}
                                title="1–3 Kişi"
                                description="Küçük araştırma veya kalite kontrol laboratuvarı."
                            />
                            <OptionCard
                                id="capacity-medium"
                                selected={answers.capacity === 'medium'}
                                onClick={() => setAnswers((prev) => ({ ...prev, capacity: 'medium' as CapacityChoice }))}
                                icon={<Users className="w-5 h-5" />}
                                title="4–10 Kişi"
                                description="Orta ölçekli üretim veya sertifikasyon laboratuvarı."
                            />
                            <OptionCard
                                id="capacity-large"
                                selected={answers.capacity === 'large'}
                                onClick={() => setAnswers((prev) => ({ ...prev, capacity: 'large' as CapacityChoice }))}
                                icon={<Users2 className="w-5 h-5" />}
                                title="10+ Kişi"
                                description="Endüstriyel veya akredite referans laboratuvarı."
                            />
                        </div>
                    </AnimatedStep>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                        <button
                            id="wizard-prev"
                            onClick={goPrev}
                            disabled={currentVisibleIndex === 0}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-slate-200 text-slate-600 text-sm font-medium transition-all hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Geri
                        </button>

                        <div className="flex items-center gap-2">
                            {visibleSteps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        i === currentVisibleIndex
                                            ? 'bg-brand-500 w-6'
                                            : i < currentVisibleIndex
                                                ? 'bg-brand-300'
                                                : 'bg-slate-200'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            id="wizard-next"
                            onClick={goNext}
                            disabled={!stepValid}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand-600 text-white text-sm font-bold uppercase tracking-wider transition-all hover:bg-brand-500 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed dimension-line"
                        >
                            {canGoNext ? (
                                <>
                                    Devam <ChevronRight className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Raporu Oluştur <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
