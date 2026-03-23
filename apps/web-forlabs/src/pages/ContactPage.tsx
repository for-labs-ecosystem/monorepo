import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '@/lib/i18n'
import { submitInquiry } from '@/lib/api'
import {
    MessageSquare,
    Zap,
    LifeBuoy,
    Users,
    Send,
    Loader2,
    CheckCircle2,
    ArrowRight,
    MessageCircle
} from 'lucide-react'

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.6 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
)

// Tab definitions
type TabType = 'general' | 'quote' | 'support' | 'meeting'

const data = {
    tr: {
        heroBadge: "DESTEK & İLETİŞİM",
        heroTitle: "Size Nasıl \nYardımcı Olabiliriz?",
        heroDesc: "Uzman ekibimizle doğrudan iletişime geçin. Talebinizi en doğru şekilde yönlendirebilmemiz için lütfen aşağıdaki seçeneklerden birini belirleyin.",

        // Tabs
        tabGeneral: "Genel İletişim",
        tabGeneralDesc: "Soru, görüş ve genel bilgilendirme.",
        tabQuote: "Hızlı Teklif",
        tabQuoteDesc: "Projeniz için fiyat teklifi alın.",
        tabSupport: "Teknik Destek",
        tabSupportDesc: "Cihaz ve bakım talepleriniz için.",
        tabMeeting: "Proje Toplantısı",
        tabMeetingDesc: "Uzmanlarımızla toplantı planlayın.",

        // Form Titles and Global WhatsApp
        formTitleGeneral: "Bize Mesaj Bırakın.",
        formTitleQuote: "Teklif İsteğinizi Detaylandırın.",
        formTitleSupport: "Teknik Destek Merkezi.",
        formTitleMeeting: "Projenizi Birlikte Konuşalım.",

        // Form Fields
        fName: "Ad Soyad",
        fNamePlaceholder: "Örn: Ahmet Yılmaz",
        fEmail: "E-Posta Adresi",
        fEmailPlaceholder: "bilgi@sirket.com",
        fPhone: "Telefon",
        fPhonePlaceholder: "+90 (___) ___ __ __",
        fCompany: "Kurum / Firma",
        fCompanyPlaceholder: "Firma adınızı girin",
        fSubject: "Konu",
        fSubjectPlaceholder: "Nasıl yardımcı olabiliriz?",
        fMessage: "Mesajınız",
        fMessagePlaceholder: "Detayları buraya yazabilirsiniz...",

        fProductGroup: "İlgilenilen Ürün Grubu",
        fProductGroupPlaceholder: "Seçiniz...",
        fSerialNo: "Cihaz Seri No (Opsiyonel)",
        fSerialNoPlaceholder: "SN-...",
        fProjectType: "Proje Tipi",
        fProjectTypePlaceholder: "Seçiniz...",

        btnSubmit: "Talebi Gönder",
        btnSubmitSending: "Gönderiliyor...",

        msgSuccess: "Talebiniz başarıyla alındı. Uzman ekibimiz kısa süre içerisinde sizinle iletişime geçecektir.",
        msgError: "Bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.",

        whatsappTitle: "Uzmanlardan anında yanıt alın.",
        whatsappSubtitle: "WhatsApp destek hattımız üzerinden doğrudan ekibimizle iletişime geçebilir, sorularınızı iletebilirsiniz.",
    },
    en: {
        heroBadge: "SUPPORT & CONTACT",
        heroTitle: "How Can We \nHelp You?",
        heroDesc: "Get in touch directly with our expert team. Please select an option below so we can direct your request appropriately.",

        tabGeneral: "General Contact",
        tabGeneralDesc: "For questions and general info.",
        tabQuote: "Quick Quote",
        tabQuoteDesc: "Get a price quote for your project.",
        tabSupport: "Technical Support",
        tabSupportDesc: "For maintenance and device requests.",
        tabMeeting: "Project Meeting",
        tabMeetingDesc: "Schedule a meeting with experts.",

        formTitleGeneral: "Leave Us a Message.",
        formTitleQuote: "Detail Your Quote Request.",
        formTitleSupport: "Technical Support Center.",
        formTitleMeeting: "Let's Discuss Your Project.",

        fName: "Full Name",
        fNamePlaceholder: "Ex: John Doe",
        fEmail: "Email Address",
        fEmailPlaceholder: "info@company.com",
        fPhone: "Phone",
        fPhonePlaceholder: "+44 (___) ___ ____",
        fCompany: "Company",
        fCompanyPlaceholder: "Enter your company name",
        fSubject: "Subject",
        fSubjectPlaceholder: "How can we help?",
        fMessage: "Your Message",
        fMessagePlaceholder: "Write the details here...",

        fProductGroup: "Product Group of Interest",
        fProductGroupPlaceholder: "Select...",
        fSerialNo: "Device Serial No (Optional)",
        fSerialNoPlaceholder: "SN-...",
        fProjectType: "Project Type",
        fProjectTypePlaceholder: "Select...",

        btnSubmit: "Submit Request",
        btnSubmitSending: "Sending...",

        msgSuccess: "Your request has been successfully received. Our expert team will contact you shortly.",
        msgError: "An error occurred. Please check your connection and try again.",

        whatsappTitle: "Get instant answers from experts.",
        whatsappSubtitle: "Connect directly with our support team via WhatsApp for quick assistance.",
    }
}

export default function ContactPage() {
    const { lang } = useLanguage()
    const content = data[lang]
    const location = useLocation()

    const [activeTab, setActiveTab] = useState<TabType>('general')

    // States
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(false)

    // Unified form data state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        productGroup: '',
        serialNo: '',
        projectType: ''
    })

    // Read query params from URL if navigated from another page
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const subjectParam = params.get('subject')
        if (subjectParam) {
            setFormData(prev => ({ ...prev, subject: subjectParam }))
            setActiveTab('quote') // automatically route to quote if came with a subject (like a product)
        }

        // Set meta tags
        document.title = lang === 'tr' ? 'İletişim | For-Labs' : 'Contact | For-Labs'
        document.querySelector('meta[name="description"]')?.setAttribute(
            'content',
            lang === 'tr'
                ? 'Projeleriniz, cihaz teknik servisi ve laboratuvar kurulum teklifleri için iletişime geçin.'
                : 'Contact us for projects, device technical service, and laboratory setup quotes.'
        )
    }, [location, lang])

    // Handle Tab Change, resetting states
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab)
        setSuccess(false)
        setError(false)
        // Clearing form is optional, but let's keep name/email if they typed it
    }

    // Handle Submit
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(false)
        setSuccess(false)

        try {
            // Build a specific payload based on the active tab context
            const payload: Record<string, string> = {
                inquiry_type: activeTab
            }

            if (formData.phone) payload.phone = formData.phone
            if (formData.company) payload.company = formData.company
            if (formData.subject) payload.subject = formData.subject
            if (formData.message) payload.message = formData.message

            // Specific fields
            if (activeTab === 'quote' && formData.productGroup) payload.product_group = formData.productGroup
            if (activeTab === 'support' && formData.serialNo) payload.serial_number = formData.serialNo
            if (activeTab === 'meeting' && formData.projectType) payload.project_type = formData.projectType

            // Create a unified subject string for the CMS list view
            let dbSubject = formData.subject || 'Genel İletişim Talebi'
            if (activeTab === 'quote') dbSubject = `Teklif Talebi${formData.subject ? ': ' + formData.subject : ''}`
            if (activeTab === 'support') dbSubject = `Teknik Destek Talebi`
            if (activeTab === 'meeting') dbSubject = `Proje Toplantı Talebi`

            await submitInquiry({
                sender_name: formData.name,
                sender_email: formData.email,
                subject: dbSubject,
                ...payload
            })

            setSuccess(true)
            // Reset only variable fields
            setFormData(prev => ({
                ...prev,
                subject: '',
                message: '',
                productGroup: '',
                serialNo: '',
                projectType: ''
            }))

        } catch (err) {
            console.error('Inquiry Submission Error:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    // Form Renderers based on active Tab
    const renderFormContent = () => {
        // ----------------------------------------
        // General Contact
        // ----------------------------------------
        if (activeTab === 'general') {
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label={content.fName} required value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder={content.fNamePlaceholder} />
                        <InputField label={content.fEmail} required type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} placeholder={content.fEmailPlaceholder} />
                    </div>
                    <InputField label={content.fSubject} required value={formData.subject} onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })} placeholder={content.fSubjectPlaceholder} />
                    <TextAreaField label={content.fMessage} required value={formData.message} onChange={(e: any) => setFormData({ ...formData, message: e.target.value })} placeholder={content.fMessagePlaceholder} />
                </div>
            )
        }
        // ----------------------------------------
        // Quick Quote
        // ----------------------------------------
        if (activeTab === 'quote') {
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label={content.fName} required value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder={content.fNamePlaceholder} />
                        <InputField label={content.fCompany} required value={formData.company} onChange={(e: any) => setFormData({ ...formData, company: e.target.value })} placeholder={content.fCompanyPlaceholder} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label={content.fEmail} required type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} placeholder={content.fEmailPlaceholder} />
                        <InputField label={content.fPhone} required type="tel" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} placeholder={content.fPhonePlaceholder} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <SelectField
                            label={content.fProductGroup}
                            value={formData.productGroup}
                            onChange={(e: any) => setFormData({ ...formData, productGroup: e.target.value })}
                            options={['Genel Sarf', 'Analiz Cihazı', 'Laboratuvar Mobilyası', 'Anahtar Teslim Proje', 'Diğer']}
                            placeholder={content.fProductGroupPlaceholder}
                        />
                        <InputField label={content.fSubject} value={formData.subject} onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })} placeholder="Opsiyonel konu" />
                    </div>
                    <TextAreaField label={content.fMessage} required value={formData.message} onChange={(e: any) => setFormData({ ...formData, message: e.target.value })} placeholder={content.fMessagePlaceholder} />
                </div>
            )
        }
        // ----------------------------------------
        // Technical Support
        // ----------------------------------------
        if (activeTab === 'support') {
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label={content.fName} required value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder={content.fNamePlaceholder} />
                        <InputField label={content.fEmail} required type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} placeholder={content.fEmailPlaceholder} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label={content.fPhone} required type="tel" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} placeholder={content.fPhonePlaceholder} />
                        <InputField label={content.fSerialNo} value={formData.serialNo} onChange={(e: any) => setFormData({ ...formData, serialNo: e.target.value })} placeholder={content.fSerialNoPlaceholder} />
                    </div>
                    <TextAreaField label={content.fMessage} required value={formData.message} onChange={(e: any) => setFormData({ ...formData, message: e.target.value })} placeholder="Yaşadığınız sorunu veya talebinizi detaylıca açıklayın..." />
                </div>
            )
        }
        // ----------------------------------------
        // Project Meeting
        // ----------------------------------------
        if (activeTab === 'meeting') {
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label={content.fName} required value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder={content.fNamePlaceholder} />
                        <InputField label={content.fEmail} required type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} placeholder={content.fEmailPlaceholder} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label={content.fCompany} required value={formData.company} onChange={(e: any) => setFormData({ ...formData, company: e.target.value })} placeholder={content.fCompanyPlaceholder} />
                        <SelectField
                            label={content.fProjectType}
                            value={formData.projectType}
                            onChange={(e: any) => setFormData({ ...formData, projectType: e.target.value })}
                            options={['Yeni Laboratuvar Kurulumu', 'Laboratuvar Modernizasyonu', 'Akreditasyon Danışmanlığı', 'Diğer']}
                            placeholder={content.fProjectTypePlaceholder}
                        />
                    </div>
                    <TextAreaField label={content.fMessage} required value={formData.message} onChange={(e: any) => setFormData({ ...formData, message: e.target.value })} placeholder="Projenizden ve hedeflerinizden bahsedin..." />
                </div>
            )
        }
    }

    // Helper for dynamic title
    const getFormTitle = () => {
        switch (activeTab) {
            case 'general': return content.formTitleGeneral
            case 'quote': return content.formTitleQuote
            case 'support': return content.formTitleSupport
            case 'meeting': return content.formTitleMeeting
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800e_1px,transparent_1px),linear-gradient(to_bottom,#8080800e_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-20 lg:px-8 lg:pt-16 lg:pb-28">

                {/* Header Segment */}
                <div className="mb-16 flex flex-col md:flex-row md:items-start justify-between gap-10">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 px-4 py-1.5 bg-white shadow-sm mb-6">
                            <LifeBuoy className="h-3.5 w-3.5 text-brand-600" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                {content.heroBadge}
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl lg:text-6xl font-medium tracking-tight text-slate-900 whitespace-pre-wrap leading-[1.1]">
                            {content.heroTitle}
                        </h1>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group min-w-full md:min-w-[420px]">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[5rem] -translate-y-8 translate-x-8 transition-transform duration-500 group-hover:scale-110" />

                            <div className="relative z-10 flex flex-col items-start">
                                <div className="mb-8">
                                    <WhatsAppIcon className="w-12 h-12 text-[#25D366]" />
                                </div>

                                <h4 className="font-serif text-2xl lg:text-3xl text-slate-900 mb-4 leading-[1.2] max-w-[280px]">
                                    {content.whatsappTitle}
                                </h4>

                                <p className="text-sm text-slate-500 font-light mb-10 max-w-[320px] leading-relaxed">
                                    {content.whatsappSubtitle}
                                </p>

                                <a
                                    href="https://wa.me/90850xxxxxx"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#25D366]/20 transition-all hover:bg-[#1DA851] hover:shadow-[#1DA851]/40 active:scale-95 group/btn"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>WhatsApp Chat</span>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Split: Left Menu, Right Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* Left Menu / Navigation Panel */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <TabButton
                            active={activeTab === 'general'}
                            onClick={() => handleTabChange('general')}
                            icon={<MessageSquare className="w-5 h-5" />}
                            title={content.tabGeneral}
                            desc={content.tabGeneralDesc}
                        />
                        <TabButton
                            active={activeTab === 'quote'}
                            onClick={() => handleTabChange('quote')}
                            icon={<Zap className="w-5 h-5" />}
                            title={content.tabQuote}
                            desc={content.tabQuoteDesc}
                        />
                        <TabButton
                            active={activeTab === 'support'}
                            onClick={() => handleTabChange('support')}
                            icon={<LifeBuoy className="w-5 h-5" />}
                            title={content.tabSupport}
                            desc={content.tabSupportDesc}
                        />
                        <TabButton
                            active={activeTab === 'meeting'}
                            onClick={() => handleTabChange('meeting')}
                            icon={<Users className="w-5 h-5" />}
                            title={content.tabMeeting}
                            desc={content.tabMeetingDesc}
                        />
                    </div>

                    {/* Right Area / Form Panel */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.05),transparent_70%)] pointer-events-none" />

                            <div className="relative z-10">
                                <h3 className="font-serif text-3xl font-medium text-slate-900 mb-8 border-b border-slate-100 pb-8">
                                    {getFormTitle()}
                                </h3>

                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                                        <div className="h-20 w-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <p className="text-xl font-medium text-slate-900 mb-2">{content.msgSuccess}</p>
                                        <button
                                            onClick={() => setSuccess(false)}
                                            className="mt-8 px-6 py-2.5 rounded-full border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50"
                                        >
                                            {lang === 'tr' ? 'Yeni Mesaj Gönder' : 'Send New Message'}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={onSubmit} className="flex flex-col gap-8">
                                        {renderFormContent()}

                                        {error && (
                                            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
                                                {content.msgError}
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="group flex items-center gap-3 rounded-full bg-slate-900 px-8 py-3.5 text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                {loading ? content.btnSubmitSending : content.btnSubmit}
                                                {!loading && <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// Subcomponents

function TabButton({ active, icon, title, desc, onClick }: { active: boolean, icon: React.ReactNode, title: string, desc: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`group flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 text-left cursor-pointer w-full ${active ? 'bg-white border-brand-200 shadow-xl shadow-brand-100/30 ring-1 ring-brand-500/10' : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300'}`}
        >
            <div className="flex items-center gap-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${active ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                    {icon}
                </div>
                <div>
                    <h4 className={`font-serif text-lg font-medium transition-colors ${active ? 'text-brand-900' : 'text-slate-900'}`}>{title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{desc}</p>
                </div>
            </div>
            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${active ? 'text-brand-500 translate-x-1' : 'text-slate-300 group-hover:text-slate-400'}`} />
        </button>
    )
}

function InputField({ label, placeholder, type = "text", required, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">{label} {required && '*'}</label>
            <input
                type={type}
                required={required}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/30"
            />
        </div>
    )
}

function TextAreaField({ label, placeholder, required, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">{label} {required && '*'}</label>
            <textarea
                required={required}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/30 resize-none"
            />
        </div>
    )
}

function SelectField({ label, placeholder, options, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] text-slate-900 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/30 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[size:16px]"
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    )
}
