import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, RotateCcw, CheckCircle2, ChevronDown, Sparkles, Edit2, Loader2 } from 'lucide-react'
import { postMatch } from '@/lib/api'
import type { MatchProduct, MatchArticle, WizardStepData } from '@/lib/api'
import { WizardResults } from '@/components/sections/WizardResults'
import { useLanguage, t } from '@/lib/i18n'
import { useWizardSteps } from '@/hooks/useWizardSteps'

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
      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 25000)
      particles = Array.from({ length: Math.min(count, 50) }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }))
    }

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Move particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      }

      // Draw connections
      const maxDist = 200
      ctx.beginPath()
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
          }
        }
      }
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.06)' // Brand blue, very faint
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Draw dots
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(37, 99, 235, 0.2)'
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()

    const handleResize = () => {
      resize()
      initParticles()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white">
      {/* Soft Gradients */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-200 h-200 bg-blue-50/50 rounded-full blur-[120px] mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-150 h-150 bg-indigo-50/50 rounded-full blur-[100px] mix-blend-multiply" />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}

// ─── Step definitions (dynamic from CMS) ───
interface StepOption {
  label: string
  value: string
  desc?: string
  match_tags: string[]
}

interface WizardStep {
  id: number
  title: string
  prefix: string
  suffix: string
  field: string
  options: StepOption[]
}

function mapApiStepsToLocal(apiSteps: WizardStepData[], lang: string): WizardStep[] {
  return apiSteps.map((s) => ({
    id: s.id,
    title: (lang === 'en' ? s.title_en : s.title) || s.field_key,
    prefix: (lang === 'en' ? s.prefix_en : s.prefix) || '',
    suffix: (lang === 'en' ? s.suffix_en : s.suffix) || '',
    field: s.field_key,
    options: s.options.map((o) => ({
      label: (lang === 'en' ? o.label_en : o.label) || o.label,
      value: o.value,
      desc: (lang === 'en' ? o.description_en : o.description) || undefined,
      match_tags: o.match_tags ?? [],
    })),
  }))
}


// ─── Main Page ───
export default function WizardPage() {
  const { lang } = useLanguage()
  const { data: wizardData, isLoading: stepsLoading, error: stepsError } = useWizardSteps()
  const steps = useMemo(
    () => mapApiStepsToLocal(wizardData?.data ?? [], lang),
    [wizardData, lang]
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({})
  const [openDropdown, setOpenDropdown] = useState<boolean>(false)
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [results, setResults] = useState<{
    products: MatchProduct[]
    articles: MatchArticle[]
  } | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const stepContainerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false)
        setDropdownRect(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keep fixed dropdown position in sync while scrolling / resizing
  useEffect(() => {
    if (!openDropdown) return
    function updatePos() {
      if (triggerRef.current) {
        setDropdownRect(triggerRef.current.getBoundingClientRect())
      }
    }
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [openDropdown])

  // Auto-scroll to active step
  useEffect(() => {
    if (stepContainerRef.current) {
        // Find the active step element and scroll into view gently
        const activeElement = stepContainerRef.current.children[currentStep] as HTMLElement
        if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }
  }, [currentStep])

  const handleSelect = useCallback(
    (stepIndex: number, option: StepOption) => {
      const step = steps[stepIndex]
      setSelections((prev) => ({ ...prev, [step.field]: option.value }))
      // Store match_tags for this step's selected option
      setSelectedTags((prev) => ({ ...prev, [step.field]: option.match_tags }))
      setOpenDropdown(false)
      setDropdownRect(null)
      
      // Auto-advance
      if (stepIndex === currentStep) {
        setTimeout(() => setCurrentStep(stepIndex + 1), 400)
      }
    },
    [currentStep, steps]
  )

  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    setSubmitError(null)
    // Build dynamic steps payload with match_tags
    const dynamicSteps = steps
      .filter((s) => selections[s.field])
      .map((s) => ({
        field_key: s.field,
        match_tags: selectedTags[s.field] ?? [],
      }))
    try {
      const response = await postMatch({ steps: dynamicSteps })
      setResults({
        products: response.data.products,
        articles: response.data.articles,
      })
    } catch (err) {
      console.error('[Wizard] Match API error:', err)
      setSubmitError(t('wizard.apiError', lang))
    } finally {
      setIsLoading(false)
    }
  }, [selections, selectedTags, steps, lang])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setSelections({})
    setSelectedTags({})
    setResults(null)
    setSubmitError(null)
    setOpenDropdown(false)
    setDropdownRect(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const allFilled = steps.every((s) => selections[s.field])
  const hasStarted = steps.some((s) => selections[s.field])

  // ─── STEPS LOADING VIEW ───
  if (stepsLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <PlexusBackground />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
          <p className="mt-4 text-sm text-slate-400">{lang === 'en' ? 'Loading wizard...' : 'Sihirbaz yükleniyor...'}</p>
        </div>
      </div>
    )
  }

  // ─── STEPS ERROR / EMPTY VIEW ───
  if (stepsError || steps.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <PlexusBackground />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-slate-500">{lang === 'en' ? 'Wizard is currently unavailable.' : 'Sihirbaz şu anda kullanılamıyor.'}</p>
          <Link to="/" className="mt-4 text-xs font-semibold text-brand-600 hover:underline">
            {lang === 'en' ? 'Back to Home' : 'Ana Sayfaya Dön'}
          </Link>
        </div>
      </div>
    )
  }

  // ─── RESULTS VIEW ───
  if (results) {
    return (
      <WizardResults
        products={results.products}
        articles={results.articles}
        onReset={handleReset}
      />
    )
  }

  // ─── LOADING VIEW ───
  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <PlexusBackground />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="relative">
             <div className="absolute inset-0 animate-ping rounded-full bg-brand-100 opacity-20 duration-1000 scale-150" />
             <div className="absolute inset-0 animate-ping rounded-full bg-brand-100 opacity-20 duration-1000 delay-300 scale-125" />
             <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-2xl ring-1 ring-slate-100">
                <Sparkles className="h-12 w-12 text-brand-600 animate-pulse" />
             </div>
          </div>
          <h2 className="mt-12 font-serif text-4xl font-medium text-slate-900">{t('wizard.loadingTitle', lang)}</h2>
          <p className="mt-6 text-base text-slate-500 max-w-lg leading-relaxed">
            Wizard For-Labs, <span className="font-semibold text-slate-900">{t('wizard.loadingDescSector', lang)}</span> {t('results.descAnd', lang)} <span className="font-semibold text-slate-900">{t('wizard.loadingDescRegulations', lang)}</span> {t('wizard.loadingDesc', lang)}
          </p>
        </div>
      </div>
    )
  }

  // ─── WIZARD VIEW ───
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden selection:bg-brand-100/50">
      <title>Çözüm Sihirbazı — For Labs</title>
      <PlexusBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-10 pb-40">
        
        {/* Header */}
        <div className="flex items-center justify-between py-10">
           <Link
            to="/"
            className="group flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            {t('common.home', lang)}
          </Link>

          <div className={`font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${hasStarted ? 'text-slate-500' : 'text-slate-300'}`}>
            {t('wizard.headerTitle', lang)}
          </div>

          {hasStarted ? (
            <button
              type="button"
              onClick={handleReset}
              className="group flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('wizard.goBack', lang)}
            </button>
          ) : (
            <div className="w-24" />
          )}
        </div>

        {/* Intro Hero — shown only before any selection is made */}
        {!hasStarted && (
          <div className="mb-12 text-center">
            <h1 className="font-serif text-2xl font-medium text-slate-800 sm:text-3xl">
              {t('wizard.introTitle', lang)}
            </h1>
            <p className="mt-3 font-sans text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              {t('wizard.introDesc', lang)}
            </p>
          </div>
        )}

        {/* Narrative Accordion Flow */}
        <div className="mt-2 space-y-6" ref={stepContainerRef}>
           {steps.map((step, i) => {
             const isCurrent = i === currentStep
             const isFilled = !!selections[step.field]
             
             if (isCurrent) {
                // ─── ACTIVE CARD ───
                const selected = selections[step.field]
                const selectedOption = step.options.find((o) => o.value === selected)

                return (
                   <div key={step.id} className="relative rounded-3xl border border-white bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-md ring-1 ring-slate-100 sm:p-12 animate-fade-in-up">
                     
                     {/* Step Indicator */}
                     <div className="mb-6 flex items-center gap-3">
                       <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 font-sans text-[10px] font-bold text-white">
                         {step.id}
                       </span>
                       <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-400">
                         {step.title}
                       </span>
                     </div>

                     {/* Question / Sentence */}
                     <h2 className="font-serif text-xl font-medium leading-snug text-slate-900 sm:text-2xl lg:text-3xl">
                       {step.prefix}
                       <br className="md:hidden" />
                       <span className="inline-block mx-2 md:mx-3 align-bottom">
                         <button
                           ref={triggerRef}
                           type="button"
                           onClick={() => {
                             if (openDropdown) {
                               setOpenDropdown(false)
                               setDropdownRect(null)
                             } else {
                               const rect = triggerRef.current?.getBoundingClientRect()
                               setDropdownRect(rect ?? null)
                               setOpenDropdown(true)
                             }
                           }}
                           className="group inline-flex items-center gap-3 text-brand-600 transition-colors hover:text-brand-700"
                         >
                           <span className="border-b-2 border-brand-200 pb-1 group-hover:border-brand-400 transition-all">
                             {selectedOption?.label || '________'}
                           </span>
                           <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${openDropdown ? 'rotate-180' : ''}`} />
                         </button>
                       </span>
                       {step.suffix}
                     </h2>
                     
                     {!selected && (
                       <div className="mt-8 flex items-center gap-2 text-slate-400 animate-pulse">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">
                            {t('wizard.pleaseSelect', lang)}
                          </span>
                       </div>
                     )}
                   </div>
                )
             } else if (isFilled) {
                // ─── SUMMARY ROW (READ ONLY / EDITABLE) ───
                const selected = selections[step.field]
                const selectedOption = step.options.find((o) => o.value === selected)
                
                return (
                   <div 
                     key={step.id} 
                     onClick={() => {
                       setCurrentStep(i)
                       setOpenDropdown(false)
                     }}
                     className="group relative cursor-pointer py-3 pl-6 border-l-2 border-slate-200 transition-all hover:border-brand-400 hover:pl-8"
                   >
                     <div className="flex items-baseline gap-3">
                       <p className="font-serif text-lg leading-relaxed text-slate-500 transition-colors group-hover:text-slate-800">
                         {step.prefix}{' '}
                         <span className="font-medium text-slate-900 decoration-brand-200 decoration-1 underline-offset-4 group-hover:underline">
                           {selectedOption?.label || selected}
                         </span>{' '}
                         {step.suffix}
                       </p>
                       <div className="opacity-0 transition-opacity group-hover:opacity-100">
                         <Edit2 className="h-3.5 w-3.5 text-brand-500" />
                       </div>
                     </div>
                   </div>
                 )
             }
             
             return null // Future & Unfilled
           })}

           {/* Final Submit Action — shown when all filled, regardless of which step is active */}
           {allFilled && (
             <div className="pt-8 text-center animate-fade-in-up">
                <button
                   onClick={handleSubmit}
                   disabled={isLoading}
                   className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-slate-900 px-10 py-5 text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-2xl disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100"
                 >
                   <span className="relative z-10 flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-widest">
                     {isLoading ? t('wizard.submitting', lang) : t('wizard.submitBtn', lang)}
                     {isLoading ? (
                       <Sparkles className="h-4 w-4 animate-pulse" />
                     ) : (
                       <ArrowRight className="h-4 w-4" />
                     )}
                   </span>
                   <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:animate-shimmer" />
                 </button>
                 {submitError ? (
                   <p className="mt-4 font-sans text-sm text-red-500">{submitError}</p>
                 ) : (
                   <p className="mt-4 font-sans text-[14px] text-slate-400">
                     {t('wizard.submitDesc', lang)}
                   </p>
                 )}
             </div>
           )}
        </div>

        {/* Fixed-position Dropdown Portal — outside stacking context of blurred cards */}
        {openDropdown && dropdownRect && (() => {
          const step = steps[currentStep]
          const selected = selections[step?.field]
          return (
            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: dropdownRect.bottom + 12,
                left: Math.max(8, dropdownRect.left),
                zIndex: 9999,
                width: Math.min(384, window.innerWidth - 16),
              }}
              className="overflow-hidden rounded-2xl bg-white p-2 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 animate-fade-in-up"
            >
              <div className="max-h-80 overflow-y-auto p-1 space-y-1">
                {step?.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(currentStep, opt)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
                      selected === opt.value
                        ? 'bg-brand-50 text-brand-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-serif text-lg font-medium">{opt.label}</div>
                      {opt.desc && (
                        <div className="mt-0.5 font-sans text-[10px] text-slate-400">{opt.desc}</div>
                      )}
                    </div>
                    {selected === opt.value && (
                      <CheckCircle2 className="h-5 w-5 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
