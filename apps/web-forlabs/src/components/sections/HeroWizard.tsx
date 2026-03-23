import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ArrowRight, RotateCcw, Loader2 } from 'lucide-react'
import { postMatch } from '@/lib/api'
import type { MatchProduct, MatchArticle, WizardStepData } from '@/lib/api'
import { WizardResults } from './WizardResults'
import { useLanguage, t } from '@/lib/i18n'
import { useWizardSteps } from '@/hooks/useWizardSteps'

// ─── Step definitions (dynamic from CMS) ───
interface StepOption {
  label: string
  value: string
  match_tags: string[]
}

interface WizardStep {
  prefix: string
  suffix: string
  field: string
  options: StepOption[]
}

function mapApiSteps(apiSteps: WizardStepData[], lang: string): WizardStep[] {
  return apiSteps.map((s) => ({
    prefix: (lang === 'en' ? s.prefix_en : s.prefix) || '',
    suffix: (lang === 'en' ? s.suffix_en : s.suffix) || '',
    field: s.field_key,
    options: s.options.map((o) => ({
      label: (lang === 'en' ? o.label_en : o.label) || o.label,
      value: o.value,
      match_tags: o.match_tags ?? [],
    })),
  }))
}

// ─── Component ───
export function HeroWizard() {
  const { lang } = useLanguage()
  const { data: wizardData, isLoading: stepsLoading, error: stepsError } = useWizardSteps()
  const STEPS = useMemo(
    () => mapApiSteps(wizardData?.data ?? [], lang),
    [wizardData, lang]
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({})
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    products: MatchProduct[]
    articles: MatchArticle[]
  } | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = useCallback(
    (stepIndex: number, option: StepOption) => {
      setSelections((prev) => ({ ...prev, [STEPS[stepIndex].field]: option.value }))
      setSelectedTags((prev) => ({ ...prev, [STEPS[stepIndex].field]: option.match_tags }))
      setOpenDropdown(null)
      // Auto-advance after a short delay
      if (stepIndex === currentStep && stepIndex < STEPS.length - 1) {
        setTimeout(() => setCurrentStep(stepIndex + 1), 350)
      }
    },
    [currentStep, STEPS]
  )

  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    try {
      const dynamicSteps = STEPS
        .filter((s) => selections[s.field])
        .map((s) => ({
          field_key: s.field,
          match_tags: selectedTags[s.field] ?? [],
        }))
      const res = await postMatch({ steps: dynamicSteps })
      setResults(res.data)
    } catch {
      setResults({ products: [], articles: [] })
    } finally {
      setIsLoading(false)
    }
  }, [selections, selectedTags, STEPS])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setSelections({})
    setSelectedTags({})
    setResults(null)
    setOpenDropdown(null)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const allFilled = STEPS.every((s) => selections[s.field])

  // ─── Results view ───
  if (results) {
    return (
      <WizardResults
        products={results.products}
        articles={results.articles}
        onReset={handleReset}
      />
    )
  }

  // ─── Steps loading ───
  if (stepsLoading) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <div className="flex min-h-[40vh] flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 text-brand-500 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  // ─── Steps error / empty ───
  if (stepsError || STEPS.length === 0) {
    return null
  }

  // ─── Loading view ───
  if (isLoading) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 animate-ping rounded-full border border-brand-200" />
              <div className="absolute inset-2 animate-pulse rounded-full border-2 border-brand-300" />
              <div className="absolute inset-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
            <p className="mt-10 font-serif text-xl tracking-tight text-slate-400 italic">
              {t('heroWizard.loading', lang)}
            </p>
            <p className="mt-3 text-xs font-sans uppercase tracking-widest text-slate-300">
              {t('heroWizard.loadingSub', lang)}
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ─── Wizard form ───
  return (
    <section ref={sectionRef} className="bg-white">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <div className="pb-16 pt-14 sm:pt-16 lg:pb-20 lg:pt-20">
          {/* Micro-label */}
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-slate-400">
            {t('heroWizard.badge', lang)}
          </p>

          {/* Sentences */}
          <div className="mt-10 space-y-3">
            {STEPS.map((step, i) => {
              const isActive = i === currentStep
              const isPast = i < currentStep
              const isFuture = i > currentStep
              const selected = selections[step.field]
              const selectedLabel = step.options.find((o) => o.value === selected)?.label

              return (
                <div
                  key={step.field}
                  className={`transition-all duration-500 ease-out ${
                    isFuture ? 'pointer-events-none translate-y-2 opacity-0' : ''
                  } ${isPast ? 'opacity-40' : ''}`}
                  style={{
                    transitionDelay: isActive ? '100ms' : '0ms',
                  }}
                >
                  <p
                    className={`font-serif transition-all duration-500 ${
                      isActive
                        ? 'text-2xl leading-snug tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl lg:leading-tight'
                        : 'text-lg leading-snug tracking-tight text-slate-400 sm:text-xl'
                    }`}
                  >
                    {step.prefix}{' '}
                    {/* Clickable slot */}
                    <span className="relative inline-block" ref={openDropdown === i ? dropdownRef : undefined}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isFuture) {
                            setOpenDropdown(openDropdown === i ? null : i)
                            if (isPast) setCurrentStep(i)
                          }
                        }}
                        className={`relative inline-flex items-center gap-1 transition-colors duration-200 ${
                          selectedLabel
                            ? isActive
                              ? 'border-b-2 border-brand-500 text-brand-700'
                              : 'border-b border-dashed border-slate-300 text-slate-500'
                            : isActive
                              ? 'rounded-full bg-slate-50 px-4 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                              : 'border-b border-dashed border-slate-200 text-slate-300'
                        }`}
                      >
                        {selectedLabel || t('heroWizard.select', lang)}
                      </button>

                      {/* Dropdown */}
                      {openDropdown === i && (
                        <div className="absolute left-0 top-full z-50 mt-2 min-w-52 overflow-hidden border border-slate-100 bg-white shadow-sm">
                          {step.options.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelect(i, opt)}
                              className={`flex w-full items-center px-5 py-3 text-left font-sans text-sm transition-colors ${
                                selected === opt.value
                                  ? 'bg-slate-50 font-semibold text-slate-900'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </span>{' '}
                    {step.suffix}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Step indicator + CTA */}
          <div className="mt-14 flex items-center justify-between border-t border-slate-100 pt-8">
            {/* Progress */}
            <div className="flex items-center gap-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 transition-colors duration-300 ${
                    i <= currentStep && selections[STEPS[i].field]
                      ? 'bg-brand-500'
                      : i <= currentStep
                        ? 'bg-slate-200'
                        : 'bg-slate-100'
                  }`}
                />
              ))}
              <span className="ml-2 font-sans text-[10px] font-bold uppercase tracking-widest text-slate-300">
                {currentStep + 1} / {STEPS.length}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 font-sans text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t('common.reset', lang)}
                </button>
              )}

              {allFilled && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="group inline-flex items-center gap-2 bg-slate-900 px-7 py-3 font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:bg-slate-800"
                >
                  {t('heroWizard.designSystem', lang)}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
