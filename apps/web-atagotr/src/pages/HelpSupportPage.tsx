import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitInquiry, useMemberAuth } from '@forlabs/core'
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    FlaskConical,
    LifeBuoy,
    Loader2,
    MessageSquare,
    Send,
    Wrench,
    X,
    Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type SupportCategoryKey = 'general' | 'quote' | 'technical' | 'calibration'

type SupportFormState = {
    fullName: string
    email: string
    phone: string
    subject: string
    message: string
}

const categoryContent: Record<SupportCategoryKey, {
    label: string
    description: string
    icon: typeof MessageSquare
    defaultSubject: string
    subjectLabel: string
    formTitle: string
    formDescription: string
}> = {
    general: {
        label: 'Genel İletişim',
        description: 'Genel sorular, ürün yönlendirmesi ve ilk temas için bize yazın.',
        icon: MessageSquare,
        defaultSubject: 'Genel İletişim Talebi',
        subjectLabel: 'Genel İletişim Konusu',
        formTitle: 'Ekibimize mesaj bırakın',
        formDescription: 'İhtiyacınızı birkaç cümleyle paylaşın, sizi doğru uzmanlığa yönlendirelim.',
    },
    quote: {
        label: 'Hızlı Teklif',
        description: 'Atago cihazları için hızlı fiyatlandırma ve uygun ürün önerisi alın.',
        icon: Zap,
        defaultSubject: 'Hızlı Teklif Talebi',
        subjectLabel: 'Teklif Konusu',
        formTitle: 'Teklif talebinizi iletin',
        formDescription: 'İlgilendiğiniz ürün veya uygulama alanını yazın, ekibimiz en kısa sürede geri dönüş yapsın.',
    },
    technical: {
        label: 'Teknik Destek',
        description: 'Kurulum, kullanım, arıza veya operasyonel sorular için destek alın.',
        icon: Wrench,
        defaultSubject: 'Teknik Destek Talebi',
        subjectLabel: 'Teknik Destek Konusu',
        formTitle: 'Teknik destek kaydı oluşturun',
        formDescription: 'Karşılaştığınız durumu net şekilde aktarın, süreci hızlandıralım.',
    },
    calibration: {
        label: 'Kalibrasyon Talebi',
        description: 'Kalibrasyon planlaması ve ölçüm güvenilirliği taleplerinizi iletin.',
        icon: FlaskConical,
        defaultSubject: 'Kalibrasyon Talebi',
        subjectLabel: 'Kalibrasyon Konusu',
        formTitle: 'Kalibrasyon ihtiyacınızı paylaşın',
        formDescription: 'Cihaz ve ihtiyaç detayınızı iletin, uygun yönlendirmeyi sağlayalım.',
    },
}

const initialFormState: SupportFormState = {
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
}

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'

export default function HelpSupportPage() {
    const queryClient = useQueryClient()
    const { member } = useMemberAuth()
    const [activeCategory, setActiveCategory] = useState<SupportCategoryKey>('general')
    const [form, setForm] = useState<SupportFormState>(initialFormState)
    const [kvkkApproved, setKvkkApproved] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [successModalOpen, setSuccessModalOpen] = useState(false)

    const activeContent = useMemo(() => categoryContent[activeCategory], [activeCategory])

    useEffect(() => {
        document.title = 'Yardım & Destek | ATAGO TR'
        document.querySelector('meta[name="description"]')?.setAttribute(
            'content',
            'ATAGO TR yardım ve destek sayfası üzerinden genel iletişim, hızlı teklif, teknik destek ve kalibrasyon taleplerinizi iletebilirsiniz.'
        )
    }, [])

    useEffect(() => {
        setForm((prev) => {
            if (prev.subject.trim().length > 0) {
                return prev
            }

            return {
                ...prev,
                subject: activeContent.defaultSubject,
            }
        })
    }, [activeContent.defaultSubject])

    useEffect(() => {
        if (!member) return

        setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || member.full_name || '',
            email: prev.email || member.email || '',
            phone: prev.phone || member.phone || '',
        }))
    }, [member])

    const inquiryMutation = useMutation({
        mutationFn: async () => {
            const trimmedSubject = form.subject.trim() || activeContent.defaultSubject

            return submitInquiry({
                sender_name: form.fullName.trim(),
                sender_email: form.email.trim(),
                sender_phone: form.phone.trim(),
                subject: trimmedSubject,
                message: form.message.trim(),
                inquiry_type: activeCategory,
                inquiry_category_label: activeContent.label,
                inquiry_source: 'help_support_page',
                kvkk_consent: kvkkApproved ? 'approved' : 'pending',
            })
        },
        onSuccess: () => {
            setSubmitError(null)
            setSuccessModalOpen(true)
            void queryClient.invalidateQueries({ queryKey: ['member-inquiries'] })
            setForm({
                ...initialFormState,
                fullName: member?.full_name ?? '',
                email: member?.email ?? '',
                phone: member?.phone ?? '',
                subject: activeContent.defaultSubject,
            })
            setKvkkApproved(false)
        },
        onError: (error) => {
            setSubmitError(error instanceof Error ? error.message : 'Talep gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.')
        },
    })

    const handleChange = (field: keyof SupportFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.target
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleCategorySelect = (category: SupportCategoryKey) => {
        setActiveCategory(category)
        setSubmitError(null)
        setForm((prev) => ({
            ...prev,
            subject: categoryContent[category].defaultSubject,
        }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!kvkkApproved) {
            setSubmitError('Devam etmek için KVKK onayını vermeniz gerekiyor.')
            return
        }

        setSubmitError(null)
        await inquiryMutation.mutateAsync()
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {successModalOpen && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-xl overflow-hidden rounded-4xl border border-primary-100 bg-white shadow-2xl shadow-primary-900/20">
                        <button
                            type="button"
                            onClick={() => setSuccessModalOpen(false)}
                            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="bg-linear-to-r from-primary-600 to-primary-800 px-8 py-8 text-white sm:px-10">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-primary-100">Destek Talebiniz Başarıyla Alındı</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Ekibimiz talebinizi inceleyip size en kısa sürede dönecek.</h2>
                        </div>
                        <div className="space-y-6 px-8 py-8 sm:px-10">
                            <p className="text-sm leading-7 text-slate-600">
                                Talebiniz başarıyla alındı. Gelişmeleri hesabınızdaki mesajlar alanından takip edebilir, gerektiğinde ek bilgi paylaşabilirsiniz.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setSuccessModalOpen(false)}
                                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Kapat
                                </button>
                                {member && (
                                    <Link
                                        to="/hesabim?tab=messages"
                                        onClick={() => setSuccessModalOpen(false)}
                                        className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                                    >
                                        Mesajlarıma Git
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-350 px-4 pt-6 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-4xl bg-primary-900 text-white shadow-2xl shadow-primary-900/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.18),transparent_35%)]" />
                    <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
                        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-primary-100/70">
                            <Link to="/" className="transition-colors hover:text-white">Anasayfa</Link>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-white">Yardım & Destek</span>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center lg:gap-8">
                            <div className="flex min-h-[220px] max-w-4xl flex-col justify-center">
                                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary-100 backdrop-blur-md">
                                    <LifeBuoy className="h-3.5 w-3.5" />
                                    Atago TR Yardım Merkezi
                                </span>
                                <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.65rem]">
                                    Atago Cihazlarlarla İlgili Destek ve Bilgi Alın
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-100/85 sm:text-base">
                                    Sorunuzu iletin, teklif isteyin veya teknik destek talebinizi başlatın. Ekibimiz sizi en hızlı şekilde doğru sürece yönlendirsin.
                                </p>
                            </div>

                            <a
                                href="https://wa.me/905320000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative self-center overflow-hidden rounded-4xl border border-white/15 bg-white/10 p-4 text-left shadow-xl shadow-slate-950/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-white/14 hover:shadow-2xl hover:shadow-emerald-950/20"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.18),transparent_34%)] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="relative flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 text-left">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/90">
                                                Hızlı İletişim
                                            </p>
                                            <h2 className="mt-1 text-left text-xl font-black tracking-tight text-white">
                                                WhatsApp'tan Konuşalım
                                            </h2>
                                        </div>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-lg shadow-emerald-950/10 transition-transform duration-300 group-hover:scale-105">
                                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                                                <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.6 2 2.18 6.42 2.18 11.85c0 1.74.46 3.45 1.32 4.95L2 22l5.34-1.4a9.8 9.8 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.85 0-2.63-1.02-5.1-2.84-6.99Zm-7.02 15.23h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.17.83.85-3.09-.2-.32a8.15 8.15 0 0 1-1.25-4.39c0-4.49 3.65-8.15 8.16-8.15 2.18 0 4.23.84 5.77 2.39a8.1 8.1 0 0 1 2.38 5.76c0 4.49-3.66 8.14-8.09 8.14Zm4.47-6.1c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1-.37-1.91-1.18-.7-.62-1.17-1.38-1.31-1.61-.14-.24-.01-.36.11-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.31.98 2.47.12.16 1.68 2.56 4.08 3.59.57.25 1.02.4 1.37.51.58.18 1.11.15 1.53.09.47-.07 1.4-.57 1.6-1.13.2-.56.2-1.04.14-1.13-.05-.1-.21-.16-.45-.28Z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <p className="text-sm leading-6 text-primary-100/85">
                                        Uygun ürün, teknik destek veya teklif için ekibimize doğrudan yazın.
                                    </p>

                                    <div className="flex items-center justify-between gap-3 text-xs font-bold text-white">
                                        <span className="rounded-full bg-white/14 px-3 py-1.5 transition-colors duration-300 group-hover:bg-emerald-500/20">
                                            Hemen yazın
                                        </span>
                                        <span className="text-white/70 transition-colors duration-300 group-hover:text-white">
                                            7/24 talep bırakın
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            <section className="mx-auto max-w-350 px-4 pt-8 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="space-y-4 lg:col-span-4">
                        {(Object.entries(categoryContent) as Array<[SupportCategoryKey, typeof categoryContent[SupportCategoryKey]]>).map(([key, item]) => {
                            const Icon = item.icon
                            const isActive = key === activeCategory

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleCategorySelect(key)}
                                    className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 ${isActive ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-600/10' : 'border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <h2 className={`text-base font-black tracking-tight ${isActive ? 'text-primary-900' : 'text-slate-900'}`}>{item.label}</h2>
                                                <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'translate-x-1 text-primary-600' : 'text-slate-300'}`} />
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="lg:col-span-8">
                        <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
                            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_70%)]" />
                            <div className="relative">
                                <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-8 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seçili Talep Tipi</p>
                                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{activeContent.formTitle}</h2>
                                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{activeContent.formDescription}</p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
                                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary-600" />
                                        {activeContent.label}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="support-full-name" className="mb-2 block text-sm font-semibold text-slate-700">Ad Soyad</label>
                                            <input
                                                id="support-full-name"
                                                value={form.fullName}
                                                onChange={handleChange('fullName')}
                                                className={inputClassName}
                                                placeholder="Örn: Ahmet Yılmaz"
                                                autoComplete="name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="support-email" className="mb-2 block text-sm font-semibold text-slate-700">E-Posta</label>
                                            <input
                                                id="support-email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange('email')}
                                                className={inputClassName}
                                                placeholder="ornek@sirket.com"
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="support-phone" className="mb-2 block text-sm font-semibold text-slate-700">Cep Telefonu</label>
                                            <input
                                                id="support-phone"
                                                type="tel"
                                                value={form.phone}
                                                onChange={handleChange('phone')}
                                                className={inputClassName}
                                                placeholder="05XX XXX XX XX"
                                                autoComplete="tel"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="support-subject" className="mb-2 block text-sm font-semibold text-slate-700">{activeContent.subjectLabel}</label>
                                            <input
                                                id="support-subject"
                                                value={form.subject}
                                                onChange={handleChange('subject')}
                                                className={inputClassName}
                                                placeholder={activeContent.defaultSubject}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="support-message" className="mb-2 block text-sm font-semibold text-slate-700">Mesaj</label>
                                        <textarea
                                            id="support-message"
                                            value={form.message}
                                            onChange={handleChange('message')}
                                            className={`${inputClassName} min-h-40 resize-y`}
                                            placeholder="Talebinizi, cihaz modelini veya ihtiyaç duyduğunuz yönlendirmeyi detaylandırabilirsiniz..."
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4 border-t border-slate-100 pt-6">
                                        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600 transition-colors hover:border-primary-200 hover:bg-primary-50/40">
                                            <input
                                                type="checkbox"
                                                checked={kvkkApproved}
                                                onChange={(event) => setKvkkApproved(event.target.checked)}
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span>
                                                Kişisel verilerimin, talebimin değerlendirilmesi ve benimle iletişime geçilmesi amacıyla işlenmesini kabul ediyorum.
                                                {' '}
                                                <Link to="/kvkk" className="font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 transition-colors hover:text-primary-800">
                                                    KVKK Aydınlatma Metni
                                                </Link>
                                            </span>
                                        </label>

                                        {submitError && (
                                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                                {submitError}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm leading-6 text-slate-500">
                                                Talebiniz güvenli inquiry akışı üzerinden iletilir ve uygun ekip tarafından değerlendirilir.
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={inquiryMutation.isPending || !kvkkApproved}
                                                className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {inquiryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                                                {inquiryMutation.isPending ? 'Gönderiliyor...' : 'Talebi Gönder'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
