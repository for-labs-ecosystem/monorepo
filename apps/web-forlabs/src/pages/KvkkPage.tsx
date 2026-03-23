import { useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { ShieldCheck } from 'lucide-react'

export default function KvkkPage() {
    const { lang } = useLanguage()

    useEffect(() => {
        document.title = lang === 'tr' ? 'KVKK Aydınlatma Metni | For Labs' : 'GDPR Notice | For Labs'
        window.scrollTo(0, 0)
    }, [lang])

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">

                <div className="flex items-center gap-3 mb-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                        <ShieldCheck className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-medium text-slate-900">
                            {lang === 'tr' ? 'KVKK Aydınlatma Metni' : 'GDPR / Data Protection Notice'}
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
                            {lang === 'tr' ? '1. Veri Sorumlusunun Kimliği' : '1. Identity of the Data Controller'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'For Labs Laboratuvar Teknolojileri A.Ş. ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi aşağıda açıklanan amaçlar doğrultusunda işlemektedir.'
                                : 'For Labs Laboratory Technologies Inc. ("Company") processes your personal data as a data controller under applicable data protection laws, for the purposes described below.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '2. İşlenen Kişisel Veriler' : '2. Personal Data Processed'}
                        </h2>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                            <li>{lang === 'tr' ? 'Kimlik bilgileri (ad, soyad)' : 'Identity data (name, surname)'}</li>
                            <li>{lang === 'tr' ? 'İletişim bilgileri (e-posta, telefon)' : 'Contact data (email, phone)'}</li>
                            <li>{lang === 'tr' ? 'Adres bilgileri (teslimat ve fatura adresi)' : 'Address data (shipping and billing address)'}</li>
                            <li>{lang === 'tr' ? 'Sipariş ve işlem geçmişi' : 'Order and transaction history'}</li>
                            <li>{lang === 'tr' ? 'Kurumsal bilgiler (şirket adı, vergi numarası)' : 'Corporate data (company name, tax number)'}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '3. Kişisel Veri İşleme Amaçları' : '3. Purposes of Processing'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Kişisel verileriniz; sipariş işlemleri, müşteri hizmetleri, faturalama, yasal yükümlülüklerin yerine getirilmesi ve hizmet kalitesinin iyileştirilmesi amaçlarıyla işlenmektedir.'
                                : 'Your personal data is processed for order fulfillment, customer support, invoicing, legal compliance, and service improvement purposes.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '4. Hukuki Dayanak' : '4. Legal Basis'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? "Kişisel verileriniz; KVKK'nın 5. maddesi kapsamında sözleşmenin ifası, hukuki yükümlülük ve meşru menfaat hukuki sebeplerine dayalı olarak işlenmektedir."
                                : 'Your personal data is processed on the legal bases of contract performance, legal obligation, and legitimate interest.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '5. Veri Güvenliği' : '5. Data Security'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Kişisel verileriniz, yetkisiz erişim, kayıp ve ifşaya karşı teknik ve idari güvenlik önlemleriyle korunmaktadır. Tüm iletimler 256-bit SSL şifreleme ile güvence altındadır.'
                                : 'Your personal data is protected by technical and administrative security measures against unauthorized access, loss, and disclosure. All transmissions are secured with 256-bit SSL encryption.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '6. Haklarınız' : '6. Your Rights'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? "KVKK'nın 11. maddesi uyarınca; verilerinize erişim, düzeltme, silme, işlemeyi kısıtlama ve itiraz hakları dahil çeşitli haklara sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz."
                                : 'You have the right to access, correct, delete, and object to processing of your personal data. You may contact us to exercise these rights.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '7. İletişim' : '7. Contact'}
                        </h2>
                        <p>
                            {lang === 'tr' ? 'KVKK kapsamındaki talepleriniz için: ' : 'For data protection requests: '}
                            <span className="font-medium text-brand-600">kvkk@for-labs.com</span>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
