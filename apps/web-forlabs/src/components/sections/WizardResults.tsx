import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  RotateCcw,
  Cpu,
  BookOpen,
  Star,
  ShoppingCart,
  CheckCircle2,
  ExternalLink,
  Send,
  ArrowLeft,
  ChevronRight,
  X,
  Search,
  Trash2,
  Plus,
  Minus,
  Loader2,
} from 'lucide-react'
import { type MatchProduct, type MatchArticle, submitInquiry } from '@/lib/api'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useMemberAuth } from '@/lib/auth'
import { getImageUrl } from '@/lib/utils'

interface WizardResultsProps {
  products: MatchProduct[]
  articles: MatchArticle[]
  onReset: () => void
}

// ─── Plexus Canvas Background ───
function PlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: { x: number; y: number; vx: number; vy: number }[] = []

    function resize() {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx!.scale(dpr, dpr)
    }

    function initParticles() {
      if (!canvas) return
      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 22000)
      particles = Array.from({ length: Math.min(count, 60) }, () => ({
        x: Math.random() * canvas!.offsetWidth,
        y: Math.random() * canvas!.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }))
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(100,116,139,0.35)'
        ctx.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(100,116,139,${0.1 * (1 - dist / 110)})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
      animationId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()
    window.addEventListener('resize', () => { resize(); initParticles() })
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: 'block' }}
    />
  )
}

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return ''
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function WizardResults({ products, articles, onReset }: WizardResultsProps) {
  const { lang } = useLanguage()
  const { member } = useMemberAuth()
  const hasProducts = products.length > 0
  const hasArticles = articles.length > 0
  const hasResults = hasProducts || hasArticles

  const [form, setForm] = useState({
    name: member?.full_name || '',
    company: member?.company_name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    message: ''
  })
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await submitInquiry({
        sender_name: form.name,
        sender_email: form.email,
        phone: form.phone,
        company: form.company,
        message: form.message,
        subject: lang === 'en' ? 'Wizard — Lab Configuration Request' : 'Wizard — Laboratuvar Kurgu Talebi',
      })
      setFormSent(true)
    } catch (error) {
      console.error('Inquiry Submission Error:', error)
      setFormSent(true)
    } finally {
      setFormLoading(false)
    }
  }, [form, lang])

  // Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedQuoteProducts, setSelectedQuoteProducts] = useState<Array<MatchProduct & { quantity: number }>>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setSelectedQuoteProducts(products.map(p => ({ ...p, quantity: 1 })))
  }, [products])

  const updateQuantity = useCallback((id: string | number, delta: number) => {
    setSelectedQuoteProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, quantity: Math.max(1, p.quantity + delta) }
      }
      return p
    }))
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const API_BASE = import.meta.env.VITE_API_URL as string
        const SITE_ID = import.meta.env.VITE_SITE_ID as string
        const res = await fetch(`${API_BASE}/api/products?site_id=${SITE_ID}&search=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const json = await res.json()
          const existingIds = new Set(selectedQuoteProducts.map(p => p.id))
          const results = json.data?.filter((p: any) => !existingIds.has(p.id)) || []
          setSearchResults(results)
        }
      } catch (err) {
        // ignore
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedQuoteProducts])

  const [quoteForm, setQuoteForm] = useState({
    name: member?.full_name || '',
    company: member?.company_name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    message: ''
  })
  const [quoteFormSent, setQuoteFormSent] = useState(false)
  const [quoteFormLoading, setQuoteFormLoading] = useState(false)

  const handleQuoteFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQuoteForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleQuoteFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setQuoteFormLoading(true)
    try {
      const productListText = selectedQuoteProducts.length > 0
        ? selectedQuoteProducts.map(p => {
          const priceText = p.price !== null ? ` (${formatPrice(p.price * p.quantity, p.currency)})` : ''
          return `- ${p.quantity}x ${localizedField(p, 'title', lang)}${priceText}`
        }).join('\n')
        : (lang === 'en' ? 'No products selected.' : 'Ürün seçilmedi.')

      const hasPrice = selectedQuoteProducts.some(p => p.price !== null)
      const estimatedTotalText = hasPrice
        ? `\n\n${lang === 'en' ? 'Total' : 'Toplam'}: ${formatPrice(selectedQuoteProducts.reduce((acc, p) => acc + (p.price ?? 0) * p.quantity, 0), selectedQuoteProducts.find(p => p.price !== null)?.currency || 'TRY')} ${lang === 'en' ? '+ VAT' : '+ KDV'}`
        : ''

      await submitInquiry({
        sender_name: quoteForm.name,
        sender_email: quoteForm.email,
        phone: quoteForm.phone,
        company: quoteForm.company,
        message: `İlgilenilen Ürünler:\n${productListText}${estimatedTotalText}\n\nMesaj:\n${quoteForm.message}`,
        subject: lang === 'en' ? 'Wizard — Project Quote Request' : 'Wizard — Proje Teklifi Talebi',
      })
      setQuoteFormSent(true)
    } catch (error) {
      console.error('Quote Inquiry Submission Error:', error)
      setQuoteFormSent(true)
    } finally {
      setQuoteFormLoading(false)
    }
  }, [quoteForm, selectedQuoteProducts, lang])

  useEffect(() => {
    if (isQuoteModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isQuoteModalOpen])

  useEffect(() => {
    if (member) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || member.full_name || '',
        company: prev.company || member.company_name || '',
        email: prev.email || member.email || '',
        phone: prev.phone || member.phone || '',
      }))
      setQuoteForm((prev) => ({
        ...prev,
        name: prev.name || member.full_name || '',
        company: prev.company || member.company_name || '',
        email: prev.email || member.email || '',
        phone: prev.phone || member.phone || '',
      }))
    }
  }, [member])

  return (
    <>
      {/* ─── Results Section ─── */}
      <div className="min-h-screen bg-slate-50 selection:bg-brand-100/50">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <PlexusBackground />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-24 pt-8">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-16">
            <Link
              to="/"
              className="group flex items-center gap-3 rounded-full bg-white/50 px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-widest text-slate-500 backdrop-blur-sm transition-all hover:bg-white hover:text-brand-600 hover:shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              {t('common.home', lang)}
            </Link>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-widest text-slate-500 backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('results.restart', lang)}
            </button>
          </div>

          {/* Results Header */}
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-4 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-brand-700 shadow-sm backdrop-blur-md">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('results.badge', lang)}
            </div>
            <h1 className="mt-8 font-serif text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              {hasResults ? t('results.title', lang) : t('results.noResultsTitle', lang)}
            </h1>
            {hasResults && (
              <p className="mx-auto mt-6 max-w-lg text-lg text-slate-600 font-light leading-relaxed">
                Wizard For-Labs{' '}
                <span className="font-semibold text-slate-900 underline decoration-brand-300 decoration-2 underline-offset-2">
                  {products.length} {t('results.descHardware', lang)}
                </span>{' '}
                {t('results.descAnd', lang)}{' '}
                <span className="font-semibold text-slate-900 underline decoration-purple-300 decoration-2 underline-offset-2">
                  {articles.length} {t('results.descKnowledge', lang)}
                </span>{' '}
                {t('results.descCreated', lang)}
              </p>
            )}
          </div>

          {!hasResults && (
            <div className="flex flex-col items-center">
              <p className="text-slate-500">
                {t('results.noResultsDesc', lang)}
              </p>
              <button
                type="button"
                onClick={onReset}
                className="mt-8 rounded-full bg-slate-900 px-10 py-4 font-sans text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200"
              >
                {t('results.changeCriteria', lang)}
              </button>
            </div>
          )}

          {hasResults && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* ─── Main: Products ─── */}
              <div className="lg:col-span-8 space-y-8">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <h3 className="font-serif text-2xl text-slate-900">{t('results.hardwareTitle', lang)}</h3>
                    </div>
                    <span className="rounded-full bg-white border border-slate-200 px-3 py-1 font-sans text-[10px] font-bold text-slate-500 shadow-sm">
                      {products.length} {t('results.deviceCount', lang)}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100/80">
                    {products.map((product) => {
                      const criteria = product.matched_criteria || []
                      const compliance = parseJsonArray(product.compliance_tags)
                      return (
                        <div key={product.id} className="group flex flex-col gap-8 px-8 py-10 transition-colors hover:bg-slate-50/60 sm:flex-row">
                          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-transform group-hover:scale-105">
                            {product.image_url ? (
                              <img src={getImageUrl(product.image_url)} alt={product.title} className="h-full w-full object-contain" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                                <Cpu className="h-10 w-10" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                {product.brand && (
                                  <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-widest text-brand-600">
                                    {product.brand}
                                  </p>
                                )}
                                <h4 className="font-serif text-xl font-medium text-slate-900 transition-colors group-hover:text-brand-700">
                                  {localizedField(product, 'title', lang)}
                                </h4>
                              </div>
                              {product.price !== null && (
                                <p className="shrink-0 font-sans text-xl font-bold text-slate-900">
                                  {formatPrice(product.price, product.currency)}
                                </p>
                              )}
                            </div>

                            {(localizedField(product, 'description', lang) || product.description) && (
                              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                                {localizedField(product, 'description', lang)}
                              </p>
                            )}

                            <div className="mt-5 flex flex-wrap items-center gap-2.5">
                              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700 border border-green-100 shadow-sm">
                                <Star className="h-3 w-3 fill-green-600 text-green-600" />
                                SKOR: %{product.score}
                              </div>
                              {criteria.map((c) => (
                                <span key={c} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-600 shadow-sm">
                                  {c}
                                </span>
                              ))}
                              {compliance.slice(0, 3).map((c) => (
                                <span key={c} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-medium text-slate-500">
                                  {c}
                                </span>
                              ))}
                            </div>

                            {product.slug && (
                              <div className="mt-4">
                                <a
                                  href={`/urunler/${product.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-brand-600 transition-colors hover:text-brand-700"
                                >
                                  {t('results.productPage', lang)}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ─── Sidebar ─── */}
              <div className="lg:col-span-4 space-y-8">
                {/* Investment Summary */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
                  <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <h3 className="font-serif text-2xl">{t('results.investmentSummary', lang)}</h3>
                    </div>

                    {(() => {
                      const pricedProducts = products.filter((p) => p.price !== null)
                      const estimatedTotal = pricedProducts.reduce((sum, p) => sum + (p.price ?? 0), 0)
                      const unpricedCount = products.length - pricedProducts.length
                      return (
                        <div>
                          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {t('results.estimatedBudget', lang)}
                          </p>
                          <p className="mt-2 font-serif text-4xl">{formatPrice(estimatedTotal, 'TRY')}</p>
                          <p className="mt-1 text-sm text-slate-400 font-light">{t('results.taxNote', lang)}</p>

                          {unpricedCount > 0 && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/5 p-4 text-xs leading-relaxed text-slate-300 backdrop-blur-md border border-white/5">
                              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                              {lang === 'en' ? `${unpricedCount} product(s) require a custom pricing study.` : `Listelenen ${unpricedCount} ürün için özel fiyat çalışması gerekmektedir.`}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setIsQuoteModalOpen(true)}
                            className="group mt-10 flex w-full items-center justify-center gap-3 rounded-full bg-white py-4 text-xs font-bold uppercase tracking-widest text-slate-900 transition-all hover:scale-[1.02] hover:bg-brand-50"
                          >
                            {t('results.requestQuote', lang)}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Articles / Know-How */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/30 p-6">
                    <BookOpen className="h-5 w-5 text-slate-400" />
                    <h3 className="font-serif text-lg text-slate-900">{t('results.knowledgeBase', lang)}</h3>
                    <span className="ml-auto font-sans text-[10px] font-bold text-slate-300">{articles.length} {t('results.articleCount', lang)}</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {hasArticles ? (
                      articles.map((article) => (
                        <div key={article.id} className="group block p-6 transition-all hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-600">
                              {article.matched_via ? article.matched_via.split(',')[0].trim() : 'Akademi'}
                            </p>
                          </div>
                          <h4 className="font-serif text-base text-slate-900 leading-snug transition-colors group-hover:text-brand-700">
                            {localizedField(article, 'title', lang)}
                          </h4>
                          {(localizedField(article, 'excerpt', lang) || article.excerpt) && (
                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                              {localizedField(article, 'excerpt', lang)}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-slate-600">
                            {t('results.view', lang)}
                            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-sm text-slate-400 italic">
                        {t('results.noArticles', lang)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Expert Contact Form ─── */}
      <div className="relative overflow-hidden bg-slate-900">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-start">
            {/* Left: Copy */}
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-brand-400">
                {t('results.form.badge', lang)}
              </p>
              <h2 className="mt-5 font-serif text-4xl font-medium leading-tight text-white sm:text-5xl">
                {t('results.form.title1', lang)}<br />{t('results.form.title2', lang)}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-400">
                {t('results.form.desc', lang)}
              </p>

              <div className="mt-10 space-y-5">
                {[
                  { label: t('results.form.feature1', lang), desc: t('results.form.feature1Desc', lang) },
                  { label: t('results.form.feature2', lang), desc: t('results.form.feature2Desc', lang) },
                  { label: t('results.form.feature3', lang), desc: t('results.form.feature3Desc', lang) },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 ring-1 ring-brand-500/30">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              {formSent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 ring-1 ring-brand-500/30">
                    <CheckCircle2 className="h-7 w-7 text-brand-400" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-medium text-white">
                    {t('results.form.successTitle', lang)}
                  </h3>
                  <p className="mt-3 text-sm text-slate-400">
                    {t('results.form.successDesc', lang)}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('results.form.name', lang)} <span className="text-brand-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder={t('results.form.namePlaceholder', lang)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:bg-white/10 focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('results.form.company', lang)}
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleFormChange}
                        placeholder={t('results.form.companyPlaceholder', lang)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:bg-white/10 focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('results.form.email', lang)} <span className="text-brand-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleFormChange}
                        placeholder="ornek@firma.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:bg-white/10 focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('results.form.phone', lang)}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleFormChange}
                        placeholder="+90 5xx xxx xx xx"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:bg-white/10 focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('results.form.message', lang)}
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleFormChange}
                      placeholder={t('results.form.messagePlaceholder', lang)}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-brand-500/50 focus:bg-white/10 focus:ring-1 focus:ring-brand-500/30"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="group flex w-full items-center justify-center gap-3 rounded-full bg-brand-600 py-4 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-brand-900/30 transition-all hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-900/40 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-wait"
                    >
                      {formLoading ? t('common.sending', lang) : t('common.send', lang)}
                      <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Quote Modal ─── */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsQuoteModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
              {/* Left Side: Products List */}
              <div className="w-full lg:w-1/2 bg-slate-50 border-r border-slate-100 flex flex-col min-h-0 lg:max-h-full max-h-[45vh]">
                <div className="p-6 lg:p-8 border-b border-slate-200 bg-white shrink-0">
                  <div className="flex flex-col">
                    <h3 className="font-serif text-2xl text-slate-900 mb-2">
                      {lang === 'en' ? 'Recommended Products' : 'Önerilen Ürünler'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      {lang === 'en'
                        ? 'These products are recommended based on your wizard results and will be included in your quote request.'
                        : 'Bu ürünler wizard sonuçlarına göre önerilmiştir ve teklif talebinize eklenecektir.'}
                    </p>
                    {/* Add Product Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'en' ? 'Search & add products...' : 'Ürün ara ve ekle...'}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500"
                      />
                      {isSearching && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                      )}

                      {/* Search Results Dropdown */}
                      {searchQuery.trim() !== '' && !isSearching && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-20">
                          {searchResults.map((resProduct) => (
                            <button
                              key={resProduct.id}
                              type="button"
                              onClick={() => {
                                setSelectedQuoteProducts(prev => [...prev, { ...(resProduct as MatchProduct), quantity: 1 }])
                                setSearchQuery('')
                              }}
                              className="flex w-full items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-8 w-8 shrink-0 rounded bg-slate-100 flex items-center justify-center">
                                  {resProduct.image_url ? (
                                    <img src={getImageUrl(resProduct.image_url)} alt={resProduct.title} className="max-h-full max-w-full object-contain" />
                                  ) : (
                                    <Cpu className="h-4 w-4 text-slate-300" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-900 truncate">{localizedField(resProduct, 'title', lang)}</p>
                                  {resProduct.brand && <p className="text-[10px] text-brand-600">{resProduct.brand}</p>}
                                </div>
                              </div>
                              <Plus className="h-4 w-4 shrink-0 text-brand-600" />
                            </button>
                          ))}
                        </div>
                      )}
                      {searchQuery.trim() !== '' && !isSearching && searchResults.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-20 text-center text-sm text-slate-500">
                          {lang === 'en' ? 'No products found.' : 'Ürün bulunamadı.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-0 relative">
                  {selectedQuoteProducts.length === 0 ? (
                    <div className="text-center py-10 text-sm text-slate-400">
                      {lang === 'en' ? 'No products selected.' : 'Seçili ürün yok.'}
                    </div>
                  ) : (
                    selectedQuoteProducts.map((product) => (
                      <div key={product.id} className="flex gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm items-center transition-all hover:border-slate-200 group">
                        <div className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 p-1.5 flex items-center justify-center bg-slate-50">
                          {product.image_url ? (
                            <img src={getImageUrl(product.image_url)} alt={product.title} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Cpu className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          {product.brand && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 mb-0.5 block truncate">{product.brand}</span>
                          )}
                          <span className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                            {localizedField(product, 'title', lang)}
                          </span>
                          {product.price !== null && (
                            <span className="mt-1 block text-[11px] font-bold text-slate-500">
                              {formatPrice(product.price * product.quantity, product.currency)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg p-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, -1)}
                            className="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm transition hover:text-slate-900 border border-slate-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-slate-900 select-none">
                            {product.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, 1)}
                            className="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm transition hover:text-slate-900 border border-slate-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedQuoteProducts(prev => prev.filter(p => p.id !== product.id))}
                          className="h-8 w-8 ml-1 shrink-0 rounded-full flex items-center justify-center text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                          title={lang === 'en' ? 'Remove' : 'Kaldır'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {selectedQuoteProducts.some(p => p.price !== null) && (
                  <div className="p-6 border-t border-slate-200 bg-white shrink-0 mt-auto shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">
                        {lang === 'en' ? 'Total' : 'Toplam'}
                      </span>
                      <span className="font-serif text-2xl font-medium text-slate-900">
                        {formatPrice(
                          selectedQuoteProducts.reduce((acc, p) => acc + (p.price ?? 0) * p.quantity, 0),
                          selectedQuoteProducts.find(p => p.price !== null)?.currency || 'TRY'
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">
                      {lang === 'en' ? '+ VAT' : '+ KDV'}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Side: Form */}
              <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col flex-1 overflow-y-auto min-h-0 bg-white">
                {quoteFormSent ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 m-auto">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-1 ring-green-100 mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="font-serif text-3xl font-medium text-slate-900 mb-4">
                      {lang === 'en' ? 'Request Sent Successfully' : 'Talebiniz Başarıyla Alındı'}
                    </h3>
                    <p className="text-slate-500 text-base max-w-sm mb-8">
                      {lang === 'en'
                        ? 'Our experts will review your details and contact you shortly with a specialized quote.'
                        : 'Uzmanlarımız projenizi inceleyecek ve en kısa sürede size özel bir teklif ile dönüş yapacaktır.'}
                    </p>
                    <button
                      onClick={() => setIsQuoteModalOpen(false)}
                      className="rounded-full bg-slate-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800"
                    >
                      {lang === 'en' ? 'Close' : 'Kapat'}
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto w-full pb-8">
                    <div className="mb-8">
                      <h3 className="font-serif text-3xl text-slate-900 mb-3 block">
                        {lang === 'en' ? 'Request a Project Quote' : 'Proje Teklifi İste'}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed block">
                        {lang === 'en'
                          ? 'Please provide your contact details and a brief message about your laboratory requirements to receive a customized quote.'
                          : 'Laboratuvar ihtiyaçlarınız hakkında kısa bir bilgi vererek, uzmanlarımızdan size özel proje ve fiyat teklifi alabilirsiniz.'}
                      </p>
                    </div>

                    <form onSubmit={handleQuoteFormSubmit} className="space-y-5 block w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                        <div className="w-full">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {t('results.form.name', lang)} <span className="text-brand-600">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={quoteForm.name}
                            onChange={handleQuoteFormChange}
                            placeholder={t('results.form.namePlaceholder', lang)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {t('results.form.company', lang)}
                          </label>
                          <input
                            type="text"
                            name="company"
                            value={quoteForm.company}
                            onChange={handleQuoteFormChange}
                            placeholder={t('results.form.companyPlaceholder', lang)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {t('results.form.email', lang)} <span className="text-brand-600">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={quoteForm.email}
                            onChange={handleQuoteFormChange}
                            placeholder="ornek@firma.com"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {t('results.form.phone', lang)}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={quoteForm.phone}
                            onChange={handleQuoteFormChange}
                            placeholder="+90 5xx xxx xx xx"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                      <div className="w-full">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          {t('results.form.message', lang)}
                        </label>
                        <textarea
                          name="message"
                          rows={4}
                          value={quoteForm.message}
                          onChange={handleQuoteFormChange}
                          placeholder={t('results.form.messagePlaceholder', lang)}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                      <div className="pt-4 w-full block">
                        <button
                          type="submit"
                          disabled={quoteFormLoading}
                          className="group flex w-full items-center justify-center gap-3 rounded-full bg-slate-900 py-4 font-sans text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-wait"
                        >
                          {quoteFormLoading ? t('common.sending', lang) : t('common.send', lang)}
                          <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
