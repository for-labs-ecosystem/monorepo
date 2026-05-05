import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ChevronLeft, FlaskConical, ShieldCheck, Tag, Building2, CheckCircle2,
    Send, MessageCircle, Layers, Zap, Beaker, Hash, Award,
} from 'lucide-react'
import { useProduct } from '@forlabs/core'
import { TiptapRenderer } from '@forlabs/core'
import { getImageUrl, formatPrice } from '@/lib/utils'
import QuoteModal from '@/components/QuoteModal'

/* ─── Helpers ─── */

/** Parse a string field that might be JSON array, comma-separated, or newline-separated. */
function parseList(value: string | null | undefined): string[] {
    if (!value) return []
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
            return parsed
                .map((x) => (typeof x === 'string' ? x : typeof x === 'object' && x !== null ? String((x as { value?: string }).value ?? '') : String(x)))
                .filter((s) => s && s.length > 0)
        }
    } catch { /* not JSON */ }
    return trimmed.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)
}

type SpecsMode = 'table' | 'html' | 'text' | 'empty'
function detectSpecsMode(specs: string | null | undefined): SpecsMode {
    if (!specs || !specs.trim()) return 'empty'
    try {
        const parsed = JSON.parse(specs)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return 'table'
    } catch { /* not JSON */ }
    if (/<[a-z][\s\S]*>/i.test(specs)) return 'html'
    return 'text'
}

function parseSpecsObject(specs: string): Array<{ key: string; value: string }> {
    try {
        const parsed = JSON.parse(specs)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return Object.entries(parsed).map(([key, val]) => ({
                key: key.replace(/_/g, ' '),
                value: typeof val === 'string' ? val : JSON.stringify(val),
            }))
        }
    } catch { /* ignore */ }
    return []
}

const WA_NUMBER = '905320000000'

/* ─── Section heading ─── */
function SectionHeading({ icon, kicker, title }: { icon: React.ReactNode; kicker: string; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-uv-500 to-clean-500 flex items-center justify-center text-white shadow-[0_6px_18px_-6px_rgba(6,182,212,0.55)]">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-uv-600 uppercase tracking-[0.22em]">{kicker}</p>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight">{title}</h2>
            </div>
        </div>
    )
}

/* ─── Quick spec card ─── */
function SpecCard({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-uv-50 flex items-center justify-center text-uv-600 shrink-0">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-0.5">{label}</p>
                <p className={`text-[13.5px] font-semibold text-slate-800 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
        </div>
    )
}

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useProduct(slug ?? '')
    const [quoteOpen, setQuoteOpen] = useState(false)
    const [activeImageIdx, setActiveImageIdx] = useState(0)

    const product = data?.data

    const gallery = useMemo<string[]>(() => {
        if (!product) return []
        const arr: string[] = []
        if (product.image_url) arr.push(product.image_url)
        if (product.gallery) {
            try {
                const parsed = JSON.parse(product.gallery) as string[]
                if (Array.isArray(parsed)) arr.push(...parsed.filter((x) => typeof x === 'string'))
            } catch { /* ignore */ }
        }
        return Array.from(new Set(arr))
    }, [product])

    const features = useMemo(() => parseList(product?.features), [product])
    const applicationAreas = useMemo(() => parseList(product?.application_areas), [product])
    const tags = useMemo(() => parseList(product?.tags), [product])
    const analysisTypes = useMemo(() => parseList(product?.analysis_types), [product])
    const complianceTags = useMemo(() => parseList(product?.compliance_tags), [product])

    const specsMode = detectSpecsMode(product?.specs)
    const specsRows = useMemo(() => (specsMode === 'table' && product?.specs ? parseSpecsObject(product.specs) : []), [specsMode, product])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-uv-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <FlaskConical className="w-12 h-12 text-uv-200 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-3">Ürün bulunamadı</h1>
                <p className="text-slate-500 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="btn-uv">Ürün Kataloğuna Dön</Link>
            </div>
        )
    }

    const activeImg = gallery[activeImageIdx] ? getImageUrl(gallery[activeImageIdx]) : null
    const waMessage = encodeURIComponent(
        `Merhaba, ${product.title}${product.sku ? ` (${product.sku})` : ''} hakkında bilgi almak istiyorum.`
    )
    const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`

    /* Section visibility */
    const hasSpecsSection =
        specsMode !== 'empty' ||
        !!product.brand || !!product.model_number || !!product.sku || !!product.unit ||
        !!product.warranty_period || !!product.automation_level || analysisTypes.length > 0
    const hasContent = !!product.content
    const hasApplicationAreas = applicationAreas.length > 0
    const hasCompliance = complianceTags.length > 0 || tags.length > 0

    return (
        <>
            <title>{product.meta_title || product.title} | HijyenKontrol</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}
            {product.canonical_url && <link rel="canonical" href={product.canonical_url} />}

            <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-8 pb-24">
                {/* Breadcrumb */}
                <Link to="/urunler" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-uv-700 transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4" />
                    Ürün Kataloğu
                </Link>

                {/* ═══ HERO: gallery + info ═══ */}
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
                    <div>
                        <div className="glass-card aspect-square flex items-center justify-center overflow-hidden p-8 relative mb-4">
                            <div className="glow-uv-beam" />
                            {activeImg ? (
                                <img
                                    src={activeImg}
                                    alt={product.title}
                                    className="relative max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-md"
                                />
                            ) : (
                                <FlaskConical className="w-20 h-20 text-uv-200" />
                            )}
                            {product.campaign_label && (
                                <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-uv-500 to-clean-500 text-white text-[10.5px] font-bold px-3 py-1.5 shadow-md">
                                    {product.campaign_label}
                                </span>
                            )}
                        </div>
                        {gallery.length > 1 && (
                            <div className="grid grid-cols-5 gap-2.5">
                                {gallery.map((g, i) => (
                                    <button
                                        key={`${g}-${i}`}
                                        onClick={() => setActiveImageIdx(i)}
                                        className={`aspect-square rounded-xl bg-white/70 border-2 overflow-hidden p-2 transition-all duration-200 ${
                                            i === activeImageIdx
                                                ? 'border-uv-400 shadow-[0_4px_16px_-4px_rgba(6,182,212,0.35)]'
                                                : 'border-white/60 hover:border-uv-200'
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(g) || ''}
                                            alt={`${product.title} ${i + 1}`}
                                            className="w-full h-full object-contain mix-blend-multiply"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        {product.brand && (
                            <span className="text-[11px] font-bold text-uv-600 uppercase tracking-[0.22em]">{product.brand}</span>
                        )}
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight tracking-tight mt-2 mb-4">{product.title}</h1>

                        {product.description && (
                            <p className="text-[15.5px] text-slate-500 leading-relaxed mb-6">{product.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-8">
                            {product.brand && (
                                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-600 bg-white/80 border border-white/70 px-3 py-1.5 rounded-full">
                                    <Building2 className="w-3 h-3 text-uv-400" />{product.brand}
                                </span>
                            )}
                            {product.sku && (
                                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500 bg-slate-50/80 border border-slate-100 px-3 py-1.5 rounded-full font-mono">
                                    <Tag className="w-3 h-3" />{product.sku}
                                </span>
                            )}
                            {product.model_number && (
                                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500 bg-slate-50/80 border border-slate-100 px-3 py-1.5 rounded-full font-mono">
                                    <Hash className="w-3 h-3" />{product.model_number}
                                </span>
                            )}
                            {product.warranty_period && (
                                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-clean-700 bg-clean-50/80 border border-clean-100 px-3 py-1.5 rounded-full">
                                    <ShieldCheck className="w-3 h-3" />{product.warranty_period}
                                </span>
                            )}
                            {product.unit && (
                                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500 bg-slate-50/80 border border-slate-100 px-3 py-1.5 rounded-full">
                                    <Layers className="w-3 h-3" />{product.unit}
                                </span>
                            )}
                        </div>

                        {/* Price + CTAs */}
                        <div className="glass-card p-6 mb-6">
                            {product.price ? (
                                <div className="mb-5">
                                    <p className="text-[10.5px] text-slate-400 uppercase tracking-[0.2em] font-semibold mb-1">Liste Fiyatı</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-3xl font-bold bg-gradient-to-r from-uv-600 to-clean-600 bg-clip-text text-transparent">
                                            {formatPrice(product.price, product.currency)}
                                        </p>
                                        {product.compare_price && product.compare_price > product.price && (
                                            <p className="text-base font-medium text-slate-400 line-through">
                                                {formatPrice(product.compare_price, product.currency)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-5">
                                    <p className="text-[10.5px] text-slate-400 uppercase tracking-[0.2em] font-semibold mb-1">Fiyatlandırma</p>
                                    <p className="text-lg font-semibold text-slate-700">Tesisinize özel teklif</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                                <button
                                    onClick={() => setQuoteOpen(true)}
                                    className="sm:col-span-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-uv-500 via-uv-600 to-clean-500 text-white px-5 py-3 text-[12.5px] font-semibold tracking-[0.05em] shadow-[0_8px_24px_-8px_rgba(6,182,212,0.55)] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_rgba(6,182,212,0.7)] transition-all duration-300"
                                >
                                    <Send className="w-4 h-4" />
                                    Sipariş Formu Oluştur
                                </button>
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1faa54] text-white px-5 py-3 text-[12.5px] font-semibold tracking-[0.05em] shadow-[0_8px_24px_-8px_rgba(37,211,102,0.45)] hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp'tan Yazın
                                </a>
                            </div>
                            <p className="text-[11.5px] text-slate-400 text-center mt-3 leading-relaxed">
                                Adet, teslimat ve özel koşullar için ücretsiz teklif alın.
                            </p>
                        </div>

                        {/* Features quick view */}
                        {features.length > 0 && (
                            <div className="glass-card-tight p-5">
                                <h3 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-uv-500" />
                                    Öne Çıkan Özellikler
                                </h3>
                                <ul className="space-y-2.5">
                                    {features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600 leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-clean-500 shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                     STACKED CONTENT SECTIONS (no tabs)
                     1) Teknik Özellikler
                     2) Uygulama Alanları
                     3) Uyumluluk & Etiketler
                     4) Genel Bakış (rich content) — at the end if exists
                   ═══════════════════════════════════════════════════════════ */}
                <div className="max-w-5xl mx-auto space-y-14">

                    {/* ── 1. Teknik Özellikler ── */}
                    {hasSpecsSection && (
                        <section>
                            <SectionHeading
                                icon={<Beaker className="w-4 h-4" />}
                                kicker="Spesifikasyonlar"
                                title="Teknik Özellikler"
                            />

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                {product.brand && <SpecCard icon={<Building2 className="w-4 h-4" />} label="Marka" value={product.brand} />}
                                {product.model_number && <SpecCard icon={<Hash className="w-4 h-4" />} label="Model" value={product.model_number} />}
                                {product.sku && <SpecCard icon={<Tag className="w-4 h-4" />} label="SKU" value={product.sku} mono />}
                                {product.unit && <SpecCard icon={<Layers className="w-4 h-4" />} label="Birim" value={product.unit} />}
                                {product.warranty_period && <SpecCard icon={<ShieldCheck className="w-4 h-4" />} label="Garanti" value={product.warranty_period} />}
                                {product.automation_level && <SpecCard icon={<Zap className="w-4 h-4" />} label="Otomasyon" value={product.automation_level} />}
                            </div>

                            {specsMode === 'table' && specsRows.length > 0 && (
                                <div className="overflow-hidden rounded-3xl border border-slate-200 mb-6">
                                    <table className="w-full">
                                        <tbody>
                                            {specsRows.map((row, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                                                    <td className="px-5 py-3.5 text-[12.5px] font-semibold text-slate-500 capitalize w-1/3">{row.key}</td>
                                                    <td className="px-5 py-3.5 text-[13.5px] text-slate-800">{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {specsMode === 'html' && product.specs && (
                                <div
                                    className="rounded-3xl border border-slate-200 bg-white p-6 prose prose-slate max-w-none mb-6 prose-table:w-full prose-th:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-[12px] prose-th:font-bold prose-th:uppercase prose-th:tracking-wider prose-th:text-slate-500 prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: product.specs }}
                                />
                            )}
                            {specsMode === 'text' && product.specs && (
                                <div className="rounded-3xl border border-slate-200 bg-slate-50/40 p-6 mb-6">
                                    <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">{product.specs}</p>
                                </div>
                            )}

                            {analysisTypes.length > 0 && (
                                <div className="rounded-3xl border border-clean-100 bg-clean-50/30 p-6">
                                    <h4 className="text-[11px] font-bold text-clean-700 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                                        <Beaker className="w-3 h-3" />Analiz Türleri
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisTypes.map((a, i) => (
                                            <span key={i} className="rounded-full bg-white border border-clean-200 px-3 py-1.5 text-[12px] font-medium text-clean-800">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ── 2. Uygulama Alanları ── */}
                    {hasApplicationAreas && (
                        <section>
                            <SectionHeading
                                icon={<Layers className="w-4 h-4" />}
                                kicker="Kullanım Alanları"
                                title="Uygulama Alanları"
                            />
                            <div className="rounded-3xl border border-uv-100 bg-gradient-to-br from-uv-50/50 via-white to-clean-50/40 p-6 sm:p-8">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {applicationAreas.map((area, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/80 px-4 py-3">
                                            <CheckCircle2 className="w-4 h-4 text-uv-500 shrink-0 mt-0.5" />
                                            <span className="text-[13px] text-slate-700 leading-snug">{area}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── 3. Uyumluluk & Etiketler ── */}
                    {hasCompliance && (
                        <section>
                            <SectionHeading
                                icon={<Award className="w-4 h-4" />}
                                kicker="Sertifikalar"
                                title="Uyumluluk & Etiketler"
                            />
                            <div className="space-y-5">
                                {complianceTags.length > 0 && (
                                    <div className="rounded-3xl border border-uv-100 bg-gradient-to-br from-uv-50/50 to-white p-6 sm:p-8">
                                        <h3 className="text-[11px] font-bold text-uv-700 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5" />Uyumluluk Standartları
                                        </h3>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {complianceTags.map((c, i) => (
                                                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white border border-uv-100 px-4 py-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-uv-500 to-clean-500 flex items-center justify-center shrink-0">
                                                        <ShieldCheck className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-slate-700 leading-tight">{c}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tags.length > 0 && (
                                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-3">Etiketler</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((t, i) => (
                                                <span key={i} className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600">#{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── 4. Genel Bakış (rich content) ── */}
                    {hasContent && (
                        <section>
                            <SectionHeading
                                icon={<FlaskConical className="w-4 h-4" />}
                                kicker="Detaylı Bilgi"
                                title="Genel Bakış"
                            />
                            <div className="glass-card p-6 sm:p-8 lg:p-12">
                                <TiptapRenderer content={product.content!} />
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <QuoteModal
                open={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                product={{
                    id: product.id,
                    title: product.title,
                    image_url: product.image_url,
                    brand: product.brand,
                    model_number: product.model_number,
                    description: product.description,
                    price: product.price,
                    currency: product.currency,
                    sku: product.sku,
                }}
            />
        </>
    )
}
