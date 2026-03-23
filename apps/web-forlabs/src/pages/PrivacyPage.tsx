import { useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { Lock } from 'lucide-react'

export default function PrivacyPage() {
    const { lang } = useLanguage()

    useEffect(() => {
        document.title = lang === 'tr' ? 'Gizlilik Politikası | For Labs' : 'Privacy Policy | For Labs'
        window.scrollTo(0, 0)
    }, [lang])

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">

                <div className="flex items-center gap-3 mb-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                        <Lock className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-medium text-slate-900">
                            {lang === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {lang === 'tr' ? 'Son güncelleme: Mart 2026' : 'Last updated: March 2026'}
                        </p>
                    </div>
                </div>

                <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-800">
                        ⚠️ {lang === 'tr' ? 'Bu sayfa taslak içerik barındırmaktadır.' : 'This page contains draft content.'}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                        {lang === 'tr'
                            ? 'Nihai hukuki metin bir avukat tarafından hazırlandıktan sonra güncellenecektir.'
                            : 'Final legal text will be updated once prepared by a legal professional.'}
                    </p>
                </div>

                <div className="space-y-8 text-[14px] text-slate-700 leading-relaxed">
                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '1. Giriş' : '1. Introduction'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'For Labs olarak gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.'
                                : 'At For Labs, we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our services.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '2. Toplanan Bilgiler' : '2. Information We Collect'}
                        </h2>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                            <li>{lang === 'tr' ? 'Hesap oluşturma sırasında sağladığınız bilgiler' : 'Information provided during account creation'}</li>
                            <li>{lang === 'tr' ? 'Sipariş ve işlem bilgileri' : 'Order and transaction information'}</li>
                            <li>{lang === 'tr' ? 'Site kullanım verileri ve çerezler' : 'Site usage data and cookies'}</li>
                            <li>{lang === 'tr' ? 'Müşteri hizmetleri yazışmaları' : 'Customer support communications'}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '3. Bilgilerin Kullanımı' : '3. How We Use Information'}
                        </h2>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                            <li>{lang === 'tr' ? 'Sipariş ve hizmetlerin sağlanması' : 'Order fulfillment and service delivery'}</li>
                            <li>{lang === 'tr' ? 'Müşteri desteği ve iletişim' : 'Customer support and communication'}</li>
                            <li>{lang === 'tr' ? 'Site performansının iyileştirilmesi' : 'Improving site performance'}</li>
                            <li>{lang === 'tr' ? 'Yasal yükümlülüklerin yerine getirilmesi' : 'Legal compliance'}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '4. Çerezler' : '4. Cookies'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bazı özellikler düzgün çalışmayabilir.'
                                : 'Our site uses cookies to improve user experience. You may disable cookies in your browser settings; however, some features may not function properly.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '5. Üçüncü Taraflarla Paylaşım' : '5. Third-Party Sharing'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Kişisel verileriniz; ödeme işlemcileri, kargo şirketleri ve yasal zorunluluklar dışında üçüncü taraflarla paylaşılmamaktadır.'
                                : 'Your personal data is not shared with third parties except payment processors, shipping companies, and as required by law.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '6. Veri Güvenliği' : '6. Data Security'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktayız. Tüm iletişimler 256-bit SSL/TLS şifreleme ile korunmaktadır.'
                                : 'We implement industry-standard security measures to protect your data. All communications are protected with 256-bit SSL/TLS encryption.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '7. Haklarınız' : '7. Your Rights'}
                        </h2>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                            <li>{lang === 'tr' ? 'Verilerinize erişim ve kopyalarını talep etme' : 'Right to access and obtain copies of your data'}</li>
                            <li>{lang === 'tr' ? 'Hatalı verilerin düzeltilmesini isteme' : 'Right to correct inaccurate data'}</li>
                            <li>{lang === 'tr' ? 'Verilerinizin silinmesini talep etme' : 'Right to request deletion of your data'}</li>
                            <li>{lang === 'tr' ? 'Pazarlama iletişimlerinden çıkma' : 'Right to opt out of marketing communications'}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '8. İletişim' : '8. Contact'}
                        </h2>
                        <p>
                            {lang === 'tr' ? 'Gizlilik talepleriniz için: ' : 'For privacy requests: '}
                            <span className="font-medium text-brand-600">gizlilik@for-labs.com</span>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
