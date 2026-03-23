import { useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { FileText } from 'lucide-react'

export default function TermsPage() {
    const { lang } = useLanguage()

    useEffect(() => {
        document.title = lang === 'tr' ? 'Kullanım Koşulları | For Labs' : 'Terms of Use | For Labs'
        window.scrollTo(0, 0)
    }, [lang])

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">

                <div className="flex items-center gap-3 mb-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                        <FileText className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-medium text-slate-900">
                            {lang === 'tr' ? 'Kullanım Koşulları' : 'Terms of Use'}
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
                            {lang === 'tr' ? '1. Genel Hükümler' : '1. General Provisions'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Bu web sitesi For Labs Laboratuvar Teknolojileri A.Ş. tarafından işletilmektedir. Siteyi kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız.'
                                : 'This website is operated by For Labs Laboratory Technologies Inc. By using this site, you agree to the following terms of use.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '2. Hizmet Kapsamı' : '2. Scope of Services'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'For Labs, laboratuvar ölçüm cihazları, kimyasallar ve ilgili teknik hizmetlerin satışını gerçekleştirmektedir. Sunulan hizmetler, ürün bilgileri ve fiyatlar önceden haber verilmeksizin değiştirilebilir.'
                                : 'For Labs provides sales of laboratory instruments, chemicals, and related technical services. Services, product information, and pricing are subject to change without notice.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '3. Sipariş ve Satın Alma' : '3. Orders and Purchases'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Sitede verilen siparişler bir teklif niteliği taşımakta olup For Labs tarafından onaylanması ile bağlayıcı hale gelir. Ürün stok ve fiyat bilgileri anlık olarak değişkenlik gösterebilir.'
                                : 'Orders placed on the site constitute an offer and become binding upon confirmation by For Labs. Product availability and prices may change in real time.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '4. Ödeme Koşulları' : '4. Payment Terms'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Ödeme işlemleri Iyzico güvenli ödeme altyapısı üzerinden gerçekleştirilmektedir. Kredi kartı bilgileriniz tarafımızca saklanmamaktadır.'
                                : 'Payments are processed through the Iyzico secure payment infrastructure. We do not store your credit card information.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '5. İptal ve İade' : '5. Cancellation and Returns'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Siparişinizi teslimattan önce iptal etmek için müşteri hizmetlerimizle iletişime geçebilirsiniz. İade koşulları, ürün türüne ve teslimat durumuna göre değişiklik gösterebilir.'
                                : 'To cancel an order before delivery, please contact our customer service. Return conditions may vary depending on product type and delivery status.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '6. Fikri Mülkiyet' : '6. Intellectual Property'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Bu sitede yer alan tüm içerik, görsel ve materyaller For Labs\'a aittir ve telif hukuku kapsamında korunmaktadır. İzinsiz kullanım yasaktır.'
                                : 'All content, images, and materials on this site are owned by For Labs and protected by copyright law. Unauthorized use is prohibited.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '7. Uygulanacak Hukuk' : '7. Governing Law'}
                        </h2>
                        <p>
                            {lang === 'tr'
                                ? 'Bu koşullar Türk hukukuna tabidir. Uyuşmazlıklarda İstanbul mahkemeleri yetkilidir.'
                                : 'These terms are governed by Turkish law. The courts of Istanbul shall have jurisdiction over any disputes.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">
                            {lang === 'tr' ? '8. İletişim' : '8. Contact'}
                        </h2>
                        <p>
                            {lang === 'tr' ? 'Sorularınız için: ' : 'For questions: '}
                            <span className="font-medium text-brand-600">info@for-labs.com</span>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
