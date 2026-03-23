import { useEffect } from 'react'
import { FileText, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
    useEffect(() => {
        document.title = 'Kullanım Koşulları | ATAGO TR'
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
            </button>

            <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                    <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kullanım Koşulları</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Son güncelleme: Mart 2026</p>
                </div>
            </div>

            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-800">⚠️ Bu sayfa henüz taslak içerik barındırmaktadır.</p>
                    <p className="text-xs text-amber-700 mt-1">Nihai hukuki metin bir avukat tarafından hazırlandıktan sonra bu içerik güncellenecektir.</p>
                </div>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">1. Genel Hükümler</h2>
                    <p>
                        Bu web sitesi ATAGO TR tarafından işletilmektedir. Siteyi kullanarak aşağıdaki kullanım koşullarını
                        kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız lütfen siteyi kullanmayınız.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">2. Hizmet Kapsamı</h2>
                    <p>
                        ATAGO TR, laboratuvar ölçüm cihazları ve ilgili ürünlerin satışını gerçekleştirmektedir.
                        Sunulan hizmetler, ürün bilgileri, fiyatlar ve kampanyalar önceden haber verilmeksizin değiştirilebilir.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">3. Sipariş ve Satın Alma</h2>
                    <p>
                        Sitede verilen siparişler bir teklif niteliği taşımakta olup ATAGO TR tarafından onaylanması ile
                        bağlayıcı hale gelir. Ürün stok ve fiyat bilgileri anlık olarak değişkenlik gösterebilir.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">4. Ödeme Koşulları</h2>
                    <p>
                        Ödeme işlemleri güvenli ödeme altyapısı üzerinden gerçekleştirilmektedir. Kredi kartı bilgileriniz
                        tarafımızca saklanmamaktadır.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">5. İptal ve İade</h2>
                    <p>
                        Siparişinizi teslimattan önce iptal etmek için müşteri hizmetlerimizle iletişime geçebilirsiniz.
                        İade koşulları, ürün türüne ve teslimat durumuna göre değişiklik gösterebilir.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">6. Fikri Mülkiyet</h2>
                    <p>
                        Bu sitede yer alan tüm içerik, görsel ve materyaller ATAGO TR'ye aittir ve telif hukuku kapsamında
                        korunmaktadır. İzinsiz kullanım yasaktır.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">7. Sorumluluk Sınırlaması</h2>
                    <p>
                        ATAGO TR, sitede yer alan bilgilerin doğruluğu ve güncelliği konusunda azami özeni göstermekle birlikte,
                        olası hatalar nedeniyle doğacak zararlardan sorumlu tutulamaz.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">8. Uygulanacak Hukuk</h2>
                    <p>
                        Bu koşullar Türk hukukuna tabidir. Uyuşmazlıklarda İstanbul mahkemeleri yetkilidir.
                    </p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900 mb-2">9. İletişim</h2>
                    <p>Sorularınız için: <span className="font-medium text-primary-600">info@atagotr.com</span></p>
                </section>
            </div>
        </div>
    )
}
